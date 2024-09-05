export default class Venusian {

  private name: string;

  private VSN: number;

  constructor(name: string) {
    this.name = name;
    this.VSN = Math.floor(Math.random() * 100);
  }

  public get getName(): string {
    return this.name;
  }

  public get getVSN(): number {
    return this.VSN;
  }

} 