import {HttpService, Injectable} from "@nestjs/common";
import {CountryDayDto} from "./CountryDayDto";
import {map} from "rxjs/operators";
import {CountryTimeSeriesDto, TimeSeriesDto} from "./CountryTimeSeriesDto";
import {BriefDto} from "./BriefDto";
import {Observable} from "rxjs";

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
  ) {
  }

  briefData(date: string): Observable<BriefDto> {
    const allData = this.dataForDate(date);
    return allData.pipe(
      map(data => {
        let partialSum = {
          confirmed: 0,
          deaths: 0,
          recovered: 0
        };
        for (const record of data) {
          partialSum = {
            confirmed: partialSum.confirmed + record.confirmed,
            deaths: partialSum.deaths + record.deaths,
            recovered: partialSum.recovered + record.recovered
          }
        }
        return partialSum;
      })
    )
  }

  dataForDate(date: string): Observable<CountryDayDto[]> {
    const formattedDate = AppService.formatDate(date);
    const url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/" + formattedDate + ".csv";
    return this.httpService.get(url).pipe(
      map(response => {
        return AppService.processData(response.data);
      })
    );
  }

  dataForDateForCountry(date: string, country: string): Observable<CountryDayDto> {
    const allData = this.dataForDate(date)
    return allData.pipe(
      map(data => {
        let partialSum: CountryDayDto = {
          provincestate: "",
          countryregion: "",
          lastUpdate: "",
          confirmed: 0,
          deaths: 0,
          recovered: 0,
          latitude: 0,
          longitude: 0
        };
        for (const record of data) {
          if (record.countryregion.toLowerCase() == country) {
            partialSum = {
              provincestate: "",
              countryregion: record.countryregion,
              lastUpdate: record.lastUpdate,
              confirmed: partialSum.confirmed + record.confirmed,
              deaths: partialSum.deaths + record.deaths,
              recovered: partialSum.recovered + record.recovered,
              latitude: record.latitude,
              longitude: record.longitude
            }
          }
        }
        return partialSum;
      })
    )
  }

  private static processData(data: string): CountryDayDto[] {
    const lines = data.split("\n");
    const result: CountryDayDto[] = [];
    for (const line of lines.slice(1)) {
      const splitLine = line.split(",");
      if (splitLine.length > 4) {
        if (lines[0].startsWith("FIPS") && splitLine[4].startsWith("20")) {
          result.push({
            provincestate: splitLine[2],
            countryregion: splitLine[3],
            lastUpdate: splitLine[4],
            confirmed: Number(splitLine[7]),
            deaths: Number(splitLine[8]),
            recovered: Number(splitLine[9]),
            latitude: Number(splitLine[5]),
            longitude: Number(splitLine[6])
          });
        } else {
          if (splitLine[2].startsWith("20")) {
            result.push({
              provincestate: splitLine[0],
              countryregion: splitLine[1],
              lastUpdate: splitLine[2],
              confirmed: Number(splitLine[3]),
              deaths: Number(splitLine[4]),
              recovered: Number(splitLine[5]),
              latitude: Number(splitLine[6]),
              longitude: Number(splitLine[7])
            });
          }
        }
      }
    }
    return result
  }

  timeSeries(): Observable<CountryTimeSeriesDto[]> {
    const url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    return this.httpService.get(url).pipe(
      map(response => {
        return this.processTimeSeries(response.data);
      })
    );
  }

  timeSeriesForCountry(country: string): Observable<CountryTimeSeriesDto> {
    return this.timeSeries().pipe(
      map(data => {
        return data.find(it => it.countryregion.toLowerCase() === country)
      })
    )
  }

  processTimeSeries(data: string): CountryTimeSeriesDto[] {
    const lines = data.split("\n");
    const result: CountryTimeSeriesDto[] = [];
    const headerDates = lines[0].split(",").slice(4);
    for (const line of lines.slice(1)) {
      const splitLine = line.split(",");
      const series: TimeSeriesDto[] = [];
      headerDates.forEach((date, index) => {
          series.push({
            date: date,
            value: Number(splitLine[index]),
          });
        }
      );
      result.push({
        provincestate: splitLine[0],
        countryregion: splitLine[1],
        lat: Number(splitLine[2]),
        long: Number(splitLine[3]),
        series: series
      });
    }
    return result
  }

  private static formatDate(date: string): string {
    const splitDate = date.split("-");
    return splitDate[1] + "-" + splitDate[2] + "-" + splitDate[0];
  }
}
