// eventBus.js
import EventEmitter from 'event-emitter';

class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }

  // 存点击事件
  on(event, callback) {
    this.emitter.on(event, callback);
  }

  // 销毁点击事件
  off(event, callback) {
    this.emitter.off(event, callback);
  }

  // 获取点击事件
  emit(event, ...args) {
    this.emitter.emit(event, ...args);
  }
}

const eventBus = new EventBus();
export default eventBus;