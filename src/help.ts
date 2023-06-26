import ololog from 'ololog';

export const log = ololog.unlimited.configure({
  stringify: {
    fancy: false,
    indentation: '  ',
  },
});
