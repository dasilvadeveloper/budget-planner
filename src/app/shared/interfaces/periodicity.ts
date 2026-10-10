import { Periodicities } from "../enums/periodicity";

export interface Periodicity {
  startDate: Date | undefined;
  endDate: Date | undefined;
  periodicity?: Periodicities;
}
