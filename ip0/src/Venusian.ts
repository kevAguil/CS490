export default class Venusian {

  private name: string;

  private VSN: number;

  constructor(name: string) {
    this.name = name;
    this.VSN = Math.floor(Math.random() * 1000000000);
  }

  public getName(): string {
    return this.name;
  }

  public getVsn(): number {
    return this.VSN;
  }

} 