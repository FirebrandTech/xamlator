# Xamlator

Create XML output from JSON data using YAML templates.

## Installation

```bash
npm i @firebrandgroup/xamlator
yarn add @firebrandgroup/xamlator
```

## Usage

```typescript
import { Xamlator } from 'xamlator';
import { readFileSync } from 'fs';

const pathToTemplate = 'path/to/template.yaml';

// Create a new Xamlator instance with template string
const yamlTemplate = readFileSync(pathToTemplate, 'utf8');
const xamlator = new Xamlator({ templateString: yamlTemplate });
// or specify path to Xamlator should read the template from
const xamlator = new Xamlator({ templatePath: pathToTemplate });

// Convert JSON data to XML
xamlator.convert(/* JSON data */);
```

## Template Syntax

**[Sample YAML Template](./src/test/sample.yaml)**

You can run a sample template using the following command
which will output the generated XML to the console:

```bash
yarn example
```

### Basic Structure

There are three main parts of the template:

```yaml
# 1) Define the root element of the XML output
root: person
# 2) Define global variables
variables:
  SOME_VARIABLE: someValue
# 3) Define the elements of the XML output
elements:
  some_element: someValue
```

### Variables

There are two types of variables, variables from the JSON data and global variables.

To use a variable from the JSON data, use the following syntax:

```yaml
elements:
  some_element: ${variableName}
```

To use a global variable, use the following syntax:

```yaml
variables:
  SOME_VARIABLE: someValue
elements:
  some_element: $${SOME_VARIABLE}
```

Variables also support dot-notation to access nested properties:

```yaml
elements:
  some_element: ${nested.property}
```

### Atrributes

To define attributes of an element, use the following syntax:

```yaml
elements:
  # Define an element with an attribute by specifying the
  # properties of the element:
  some_element:
    value: someValue
    attributes:
      - name: someAttribute
        value: someAttributeValue
```

The output of the aboved YAML template will be:

```xml
<some_element someAttribute="someAttributeValue">someValue<some_element>
```

### Structure

To define the structure of the XML output, use the following syntax:

```yaml
elements:
  some_element:
    some_child_element: someValue
    another_child_element: anotherValue
```

The output of the aboved YAML template will be:

```xml
<some_element>
  <some_child_element>someValue</some_child_element>
  <another_child_element>anotherValue<another_child_element>
</some_element>
```

### Conditional and Mathematical Operations

To use conditional and mathematical operations, use the following syntax:

```yaml
elements:
  some_element: =SUM(1, 2)
```

The conditional and mathematical operations also support variables and nesting:

```yaml
elements:
  some_element: =IF(=LT(${var_1}, ${var_2})), true, false)
```

The following operators are supported:

- `=SUM(val1, val2)`: Addition
- `=DIFF(val1, val2)`: Subtraction
- `=PROD(val1, val2)`: Multiplication
- `=QUOT(val1, val2)`: Division
- `=EQ(val1, val2)`: Equality
- `=LT(val1, val2)`: Less than
- `=LTE(val1, val2)`: Less than or equal
- `=GT(val1, val2)`: Greater than
- `=GTE(val1, val2)`: Greater than or equal
- `=IF(condition, trueValue, falseValue)`: Conditional
- `=NOT(condition, trueValue, falseValue)`: Negation

## Development

### Install Dependencies

```bash
yarn
```

### Run Tests

```bash
yarn test
# or
yarn test:watch
```

### Build

```bash
yarn build
```
