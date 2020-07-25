export class CountryTimeSeriesDto {
  provincestate: string;
  countryregion: string;
  lat: number;
  long: number;
  series: Array<TimeSeriesDto>;
}

export class TimeSeriesDto {
  date: string;
  value: number;
}
