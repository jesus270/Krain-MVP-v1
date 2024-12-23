export class PublicKey {
  constructor(key: string) {
    this.key = key;
  }
  key: string;
  toString() {
    return this.key;
  }
  toBase58() {
    return this.key;
  }
  equals(other: any) {
    return this.key === other?.key;
  }
  static isOnCurve(_key: string) {
    return true;
  }
}

export class Connection {
  constructor() {}
  // Add any methods you need to mock
}

export const clusterApiUrl = jest.fn(() => "http://localhost:8899");
