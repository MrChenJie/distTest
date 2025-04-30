import { BaseProvider } from 'what-di/lib/base-provider';
import * as defaultConfig from '../config';

export class ConfigProvider extends BaseProvider<any> {
  private _config: any;

  constructor() {
    super();
    this._config = { ...defaultConfig };
  }

  public extends(config: any) {
    this._config = { ...this.config, ...config };
  }

  public get config() {
    return this._config;
  }
}
