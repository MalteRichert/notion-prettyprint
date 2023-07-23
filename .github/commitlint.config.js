module.exports = {
  rules: {
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [0, 'always', 140],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', ['lower-case', 'camel-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-enum': [
      2,
      'always',
      [
        'chore',
        'build',
        'ci',
        'docs',
        'feat',
        'feat!',
        'fix',
        'perf',
        'refactor',
        'test'
      ],
    ],
    'type-empty': [2, 'never'],
  }
};
