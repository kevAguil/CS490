import Venusian from './Venusian';

export default class Ship {

  private crew: Venusian[];

  private daughters: Ship[];

  private serialNumber: number;

  constructor(crew: Venusian[], daughters: Ship[]) {
    this.crew = crew;
    this.daughters = daughters;
    this.serialNumber = Math.floor(Math.random() * 100);
  }

  public get getCrew(): Venusian[]{
    return this.crew;
  }

  public get getDaughters(): Ship[]{
    return this.daughters;
  }

  public get getSerialNumber(): number{
    return this.serialNumber;
  }

  public hasWaldo(): boolean{
    let flag = false;
    this.crew.forEach((member) => {
      if (member.getName === 'Waldo'){
        flag = true;
      }
    });
    return flag;
  }

  public totalWaldo(): number{
    let count = 0;
    
  }





}
