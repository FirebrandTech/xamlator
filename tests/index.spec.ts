import { Xamlator } from '../src/index';

describe('Xamlator', () => {
  it('should convert basic data to xml', () => {
    const config = `
    root: 'foo'
    elements:
      fizz: 'buzz'
    `;
    const data = { foo: { fizz: 'buzz' } };
    const xml = new Xamlator({ templateString: config }).convert(data);
    expect(xml).toBe('<foo><fizz>buzz</fizz></foo>');
  });
  it('should convert a static variable to an xml element', () => {
    const config = `
    root: 'foo'
    elements:
      fizz: \${fizz\}
    `;
    const data = { fizz: 'buzz' };
    const xamlator = new Xamlator({ templateString: config });
    const xml = xamlator.convert(data);
    expect(xml).toBe('<foo><fizz>buzz</fizz></foo>');
  });
  it('should handle nested elements', () => {
    const config = `
    root: 'foo'
    elements:
      fizz:
        buzz: 'quz'
    `;
    const data = { foo: { fizz: { buzz: 'quz' } } };
    const xml = new Xamlator({ templateString: config }).convert(data);
    expect(xml).toBe('<foo><fizz><buzz>quz</buzz></fizz></foo>');
  });
  it('should handle arrays of elements', () => {
    const config = `
    root: 'foo'
    elements:
      fizzes:
        - fizz:
            buzz: \${buzz\}
    `;
    const data = { fizzes: [{ buzz: 'quz' }, { buzz: 'quz2' }] };
    const xml = new Xamlator({ templateString: config }).convert(data);
    expect(xml).toBe(
      '<foo><fizzes><fizz><buzz>quz</buzz></fizz><fizz><buzz>quz2</buzz></fizz></fizzes></foo>'
    );
  });
  it('should return value of a variable when referenced', () => {
    const config = `
    root: 'foo'
    variables:
      FIZZ: 'buzz'
    elements:
      fizz: \$\${FIZZ\}
    `;
    const data = { fizz: 'buzz' };
    const xamlator = new Xamlator({ templateString: config });
    const xml = xamlator.convert(data);
    expect(xml).toBe('<foo><fizz>buzz</fizz></foo>');
  });
  it('should perform string template operations', () => {
    const config = `
    root: 'foo'
    elements:
      fizz: "\${baz\} \${quz\}"
    `;
    const data = { baz: 'fizz', quz: 'buzz' };
    const xamlator = new Xamlator({ templateString: config });
    const xml = xamlator.convert(data);
    expect(xml).toBe('<foo><fizz>fizz buzz</fizz></foo>');
  });
  it('should apply attributes to an element', () => {
    const config = `
    root: 'foo'
    elements:
      fizz:
        value: 'buzz'
        attributes:
          - name: 'baz'
            value: 'quz'
    `;
    const data = { foo: { fizz: 'buzz' } };
    const xml = new Xamlator({ templateString: config }).convert(data);
    expect(xml).toBe('<foo><fizz baz="quz">buzz</fizz></foo>');
  });
  it('should perform artihmetic operations', () => {
    const config = `
    root: 'foo'
    elements:
      sum: =SUM(\${fizz\}, \${buzz\})
      diff: =DIFF(\${fizz\}, \${buzz\})
      prod: =PROD(\${fizz\}, \${buzz\})
      quot: =QUOT(\${fizz\}, \${buzz\})
      eq: =EQ(\${fizz\}, \${buzz\})
      gt: =GT(\${fizz\}, \${buzz\})
      lt: =LT(\${fizz\}, \${buzz\})
      gte: =GTE(\${fizz\}, \${buzz\})
      lte: =LTE(\${fizz\}, \${buzz\})
    `;
    const data = { fizz: 4, buzz: 2 };
    const xamlator = new Xamlator({ templateString: config });
    const xml = xamlator.convert(data);
    expect(xml).toBe(
      '<foo><sum>6</sum><diff>2</diff><prod>8</prod><quot>2</quot><eq>false</eq><gt>true</gt><lt>false</lt><gte>true</gte><lte>false</lte></foo>'
    );
  });
  it('should handle conditional statements', () => {
    const config = `
    root: 'foo'
    elements:
      fizz: =IF(\${buzz\}, buzz, quz)
      notfizz: =NOT(\${buzz\}, quz, buzz)
    `;
    const data = { buzz: true };
    const xamlator = new Xamlator({ templateString: config });
    const xml = xamlator.convert(data);
    expect(xml).toBe('<foo><fizz>buzz</fizz><notfizz>buzz</notfizz></foo>');
  });
});
