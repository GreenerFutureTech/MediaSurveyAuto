export interface SurveyData {
  age: string;
  site: string;
  siteOther?: string;
  frequency: string;
  qConcerns: number[];
  qBehaviors: number[];
  scoreConcerns?: number;
  scoreBehaviors?: number;
}
