import { parse } from 'yaml';
import * as fs from 'fs';

type Config = { templatePath?: string; templateString?: string };

interface Template {
  root: string;
  variables: Record<string, string>;
  elements: Record<string, any>;
}
export class Xamlator {
  private variables: Record<string, any> = {};
  private template: Template;

  constructor(config: Config) {
    const tmpl = config.templatePath
      ? fs.readFileSync(config.templatePath, 'utf8')
      : config.templateString;
    this.template = parse(tmpl);
    this.parseVariables(this.template.variables);
  }

  convert(data: any, variables?: Record<string, string>): string {
    // Merge runtime vars with config variables
    this.parseVariables({ ...variables, ...this.template.variables });
    const xmlContent = this.parseElements(this.template.elements, data);
    return `<${this.template.root}>${xmlContent}</${this.template.root}>`;
  }

  private parseVariables(variablesConfig: Record<string, string>): void {
    for (const key in variablesConfig) {
      const value = variablesConfig[key];
      this.variables[key] = this.evaluateExpression(value, null); // Use evaluateExpression to allow dynamic expressions in variables
    }
  }

  private parseElements(
    elements: Record<string, any>,
    data: any,
    path: string = ''
  ): string {
    let xml = '';
    for (const key in elements) {
      const element = elements[key];
      if (Array.isArray(element)) {
        // Handle arrays, assuming they represent multiple sub-elements or repeated structures
        const items = this.getDataValue(data, key);
        if (Array.isArray(items)) {
          xml += `<${key}>`;
          items.forEach((item) => {
            element.forEach((template) => {
              xml += this.parseElements(template, item);
            });
          });
          xml += `</${key}>`;
        }
      } else if (typeof element === 'object' && element?.value !== undefined) {
        // Handle objects that specify 'value' and possibly 'attributes'
        xml += this.renderElementWithAttributes(key, element, data);
      } else if (typeof element === 'object') {
        // Handle nested objects that do not define 'value' explicitly (recursive call)
        xml += `<${key}>${this.parseElements(element, data, path ? `${path}.${key}` : key)}</${key}>`;
      } else {
        // Handle simple elements directly assigned a string value
        const value = this.evaluateExpression(element, data);
        xml += `<${key}>${this.escapeXml(value)}</${key}>`;
      }
    }
    return xml;
  }

  private renderElementWithAttributes(
    key: string,
    element: any,
    data: any
  ): string {
    const content = this.evaluateExpression(element.value, data);
    let attributes = '';
    if (element.attributes && Array.isArray(element.attributes)) {
      element.attributes.forEach((attr) => {
        const attrValue = this.evaluateExpression(attr.value, data);
        attributes += ` ${attr.name}="${this.escapeXml(attrValue)}"`;
      });
    }
    return `<${key}${attributes}>${this.escapeXml(content)}</${key}>`;
  }

  private escapeXml(unsafe: any): string {
    if (unsafe === null || unsafe === undefined) {
      return ''; // Return an empty string for null or undefined inputs
    }
    const safeString = String(unsafe); // Convert non-string inputs to string
    return safeString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private evaluateExpression(expression: any, data: any): any {
    if (typeof expression !== 'string') {
      return expression; // Directly return the expression if it's not a string
    }

    // Check for and handle function expressions
    if (expression.startsWith('=')) {
      return this.executeFunction(expression.slice(1), data);
    }

    // Replace all placeholders with the actual data values or variable values
    return expression
      .replace(/\$\$\{([^}]+)\}/g, (match, varName) => {
        // Check if the variable name exists in the predefined variables
        if (this.variables.hasOwnProperty(varName)) {
          return this.variables[varName];
        }
        return match; // Return the original match if no variable found
      })
      .replace(/\$\{([^}]+)\}/g, (match, path) => {
        const value = this.getDataValue(data, path.trim());
        return value !== undefined ? value.toString() : '';
      });
  }

  private getDataValue(data: any, path: string): any {
    const parts = path.split('.');
    let result = data;
    for (const part of parts) {
      if (result && typeof result === 'object') {
        result = result[part];
      } else {
        return undefined;
      }
    }
    return result;
  }

  private executeFunction(functionString: string, data: any): any {
    const parseArgs = (args: string) => {
      // Split arguments carefully, considering nested function calls
      let result = [];
      let balance = 0;
      let buffer = '';
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        if (char === '(') balance++;
        if (char === ')') balance--;
        if (char === ',' && balance === 0) {
          result.push(buffer.trim());
          buffer = '';
        } else {
          buffer += char;
        }
      }
      if (buffer) result.push(buffer.trim());
      return result.map((arg) => this.evaluateExpression(arg, data));
    };

    const match = functionString.match(/^([A-Z]+)\((.*)\)$/);
    if (match) {
      const [_, func, argsString] = match;
      const args = parseArgs(argsString);

      switch (func) {
        case 'SUM':
          return +args[0] + +args[1];
        case 'DIFF':
          return +args[0] - +args[1];
        case 'PROD':
          return +args[0] * +args[1];
        case 'QUOT':
          return +args[0] / +args[1];
        case 'EQ':
          return args[0] === args[1];
        case 'LT':
          return +args[0] < +args[1];
        case 'LTE':
          return +args[0] <= +args[1];
        case 'GT':
          return +args[0] > +args[1];
        case 'GTE':
          return +args[0] > +args[1];
        case 'IF':
          return Boolean(args[0]) ? args[1] : args[2];
        case 'NOT':
          return !Boolean(args[0]) ? args[1] : args[2];
        default:
          return null; // No recognized function
      }
    }
    return null;
  }
}
