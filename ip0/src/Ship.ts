import Venusian from './Venusian';

export default class Ship {

  private crew: Venusian[];

  private daughters: Ship[];

  private serialNumber: number;

  constructor(crew: Venusian[], daughters: Ship[]) {
    this.crew = crew;
    this.daughters = daughters;
    this.serialNumber = Math.floor(Math.random() * 1000000);
  }

  public getCrew(): Venusian[]{
    return this.crew;
  }

  public getDaughters(): Ship[]{
    return this.daughters;
  }

  public getSerialNumber(): number{
    return this.serialNumber;
  }

  public hasWaldo(): boolean{
    let flag = false;
    this.crew.forEach((member) => {
      if (member.getName() === 'Waldo'){
        flag = true;
      }
    });
    return flag;
  }

  public totalWaldos(): number{
    let count = 0;
    const vsns: number[] = [];
    this.crew.forEach((member) => {
      if (member.getName() === 'Waldo' && vsns.includes(member.getVsn())){
        count += 1;
      } else if (member.getName() === 'Waldo'){
        vsns.push(member.getVsn());
        count += 1;
      }
    });
    this.daughters.forEach((daughter) => {
      count += daughter.totalWaldos();
    });

    return count;
  }

  public removeWaldos(): void{
    this.crew = this.crew.filter((member) => member.getName() !== 'Waldo');
  }

  public removeDeepWaldos(): void{
    this.crew = this.crew.filter((member) => member.getName() !== 'Waldo');
    this.daughters.forEach((daughter) => {
      daughter.removeDeepWaldos();
    });
  }

  public fleetHasDuplicates(): boolean {
    const serialNumbers: number[] = []; 
    let flag = false;
    const checkDuplicates = (ship: Ship): void => {
      if (serialNumbers.includes(ship.serialNumber)) {
        flag = true; 
        return; 
      }
      serialNumbers.push(ship.serialNumber);
      ship.daughters.forEach((daughter) => {
        if (flag) return; 
        checkDuplicates(daughter); 
      });
    };
    checkDuplicates(this);

    return flag;
  }

}
