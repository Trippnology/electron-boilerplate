import { browser } from '@wdio/globals';

describe('application launch', () => {
    it('should print application title', async () => {
        console.log('Hello', await browser.getTitle(), 'application!');
    });
});
