import { $ } from '@wdio/globals';
import { expect } from 'chai';

describe('Hello World', () => {
  it('shows hello world text on screen after launch', async () => {
    try {
      const element = await $('#greet');
      const text = await element.getText();
      expect(text).to.equal('Hello World!');
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });
});
