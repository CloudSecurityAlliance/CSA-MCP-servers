import { EmailPattern } from './schema.js';

export class EmailValidator {
  private allowList: EmailPattern[] | undefined;
  private blockList: EmailPattern[] | undefined;

  constructor(allowList?: EmailPattern[], blockList?: EmailPattern[]) {
    if (allowList && blockList) {
      throw new Error('Cannot specify both allow_list and block_list');
    }
    this.allowList = allowList;
    this.blockList = blockList;
  }

  private createRegexFromPattern(pattern: EmailPattern): RegExp {
    switch (pattern.type) {
      case 'exact':
        return new RegExp(`^${pattern.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      case 'domain':
        return new RegExp(`@${pattern.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      case 'wildcard':
        return new RegExp(`@[^@]*${pattern.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
      default:
        throw new Error(`Invalid pattern type: ${pattern.type}`);
    }
  }

  private matchesAnyPattern(email: string, patterns: EmailPattern[]): boolean {
    return patterns.some(pattern => {
      const regex = this.createRegexFromPattern(pattern);
      return regex.test(email);
    });
  }

  public isEmailAllowed(email: string): boolean {
    // If no lists are specified, allow all emails
    if (!this.allowList && !this.blockList) {
      return true;
    }

    // If allow list is specified, email must match at least one pattern
    if (this.allowList) {
      return this.matchesAnyPattern(email, this.allowList);
    }

    // If block list is specified, email must not match any pattern
    if (this.blockList) {
      return !this.matchesAnyPattern(email, this.blockList);
    }

    return true;
  }

  public static parseEmailPattern(pattern: string): EmailPattern {
    if (pattern.includes('@')) {
      // Exact email match if it's a full email address
      if (pattern.indexOf('@') !== 0) {
        return { pattern, type: 'exact' };
      }
      // Domain match if it starts with @
      return { pattern: pattern.slice(1), type: 'domain' };
    }
    // Domain wildcard match for everything else
    return { pattern, type: 'wildcard' };
  }
}