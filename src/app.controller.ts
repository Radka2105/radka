import {Controller, Get, Param, Query} from "@nestjs/common";
import {AppService} from "./app.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {
  }

  @Get("/brief")
  brief() {
    return this.appService.briefData(AppController.getDefaultDate());
  }

  @Get("/countries")
  dataForDate(
    @Query("date") date: string
  ) {
    if (!date) {
      date = AppController.getDefaultDate();
    }
    return this.appService.dataForDate(date);
  }

  @Get("/countries/:country")
  dataForDateForCountry(
    @Param("country") country: string,
    @Query("date") date: string
  ) {
    if (!date) {
      date = AppController.getDefaultDate();
    }
    return this.appService.dataForDateForCountry(date, country.toLowerCase());
  }

  @Get("/timeseries")
  timeSeries(
    @Query("country") country: string
  ) {
    if (country) {
      return this.appService.timeSeriesForCountry(country.toLowerCase());
    } else {
      return this.appService.timeSeries();
    }
  }

  @Get("/final")
  final() {
    return {
      name: "Csitariova",
      rating: 2
    }
  }

  private static getDefaultDate(): string {
    const date = new Date();
    date.setDate(date.getUTCDate() - 1);
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0")
  }
}
