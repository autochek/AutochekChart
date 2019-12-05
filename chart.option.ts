export interface AutochekChartOption {
  start?: Date;
  end?: Date;
  min?: number;
  max?: number;

  glucose?: GlucoseOption;
}

export interface GlucoseOption {
  b_meal_min?: number;
  b_meal_max?: number;
  a_meal_min?: number;
  a_meal_max?: number;
  sleep_min?: number;
  sleep_max?: number;
}
