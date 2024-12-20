# Contributing Guide

Thank you for considering contributing to Krain! This document outlines the process and guidelines for contributing to the project.

## Code of Conduct

This project and everyone participating in it are governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers@example.com].

## How Can I Contribute?

### Reporting Bugs

1. **Check Existing Issues**
   - Search the issue tracker
   - Check if the bug has already been reported
   - Check if it's already fixed in the latest version

2. **Create a Bug Report**
   - Use the bug report template
   - Include detailed steps to reproduce
   - Provide system information
   - Add relevant code samples

3. **Submit the Issue**
   - Tag with appropriate labels
   - Follow up on questions
   - Keep the issue updated

### Suggesting Enhancements

1. **Check Existing Suggestions**
   - Search for similar feature requests
   - Check the roadmap
   - Discuss in relevant issues

2. **Create a Feature Request**
   - Use the feature request template
   - Explain the use case
   - Describe expected behavior
   - Provide examples

### Pull Requests

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/krain.git
   cd krain
   git remote add upstream https://github.com/original/krain.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature
   # or
   git checkout -b fix/your-fix
   ```

3. **Make Changes**
   - Follow coding standards
   - Add tests
   - Update documentation

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Tests
   - `chore:` Maintenance

5. **Push Changes**
   ```bash
   git push origin feature/your-feature
   ```

6. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Add detailed description
   - Request review

## Development Process

### Setting Up Development Environment

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

### Code Quality

1. **Linting**
   ```bash
   pnpm lint
   ```

2. **Type Checking**
   ```bash
   pnpm type-check
   ```

3. **Testing**
   ```bash
   pnpm test
   ```

### Documentation

1. **Code Comments**
   - Use JSDoc for functions
   - Explain complex logic
   - Document type definitions

2. **README Updates**
   - Keep package READMEs updated
   - Document new features
   - Update examples

3. **API Documentation**
   - Document new endpoints
   - Update API changes
   - Include examples

## Review Process

1. **Code Review**
   - Two approvals required
   - Address all comments
   - Pass all checks

2. **Testing**
   - All tests must pass
   - Add new tests
   - Update existing tests

3. **Documentation**
   - Update relevant docs
   - Add inline comments
   - Update API docs

## Release Process

1. **Version Bump**
   - Follow semver
   - Update changelog
   - Update dependencies

2. **Testing**
   - Run full test suite
   - Verify in staging
   - Check documentation

3. **Release**
   - Create release PR
   - Add release notes
   - Tag version

## Getting Help

- Join our [Discord](https://discord.gg/example)
- Check the [FAQ](./FAQ.md)
- Ask in GitHub Discussions
- Contact maintainers

## Style Guides

### Git Commit Messages

- Use conventional commits
- Keep messages clear and concise
- Reference issues and PRs

### TypeScript Style Guide

- Use strict type checking
- Avoid `any` types
- Document complex types

### React Style Guide

- Use functional components
- Follow hooks rules
- Keep components focused

### Testing Style Guide

- Write descriptive test names
- Test edge cases
- Mock external dependencies

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing to Krain! 