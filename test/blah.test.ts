import { colors } from '@gamastudio/colorslog';

describe('blah', () => {
  it('works', async () => {
    try {
      colors.success('PROVIDER');
    } catch (error) {
      console.log(error);
    }
  });
});
