export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, missing semicolons, etc.
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding tests
        'build', // Build system or dependencies
        'ci', // CI configuration
        'chore', // Maintenance tasks
        'revert', // Revert changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'core', // @skedox/analytics-core
        'vanilla', // @skedox/analytics-vanilla
        'react', // @skedox/analytics-react
        'vue', // @skedox/analytics-vue
        'deps', // Dependencies
        'release', // Release related
        '', // Allow empty scope
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'body-max-line-length': [0], // Disable body line length
  },
};
