import { largeScreenWidth } from '_cus_utils/constants';
import { getCurrentLanguage } from 'utils/utils';

const isEn = getCurrentLanguage() === 'en_US';

/**
 * 获取查询页面 - form表单布局的span值
 * @returns {{xl: number, md: number, sm: number, xs: number, lg: number, xxl: number}}
 */
export function getLFormGridSpan() {
  return { xs: 12, sm:12, md:12, lg:12, xl:8, xxl:8 };
}

/**
 * 获取详细页面 - form表单布局的span值
 * @returns {{xl: number, md: number, sm: number, xs: number, lg: number, xxl: number}}
 */
export function getDFormGridSpan() {
  return { xs: 12, sm:12, md:12, lg:12, xl:12, xxl:8 };
}


export function responsiveChange(className, time = 10, screenWidth = largeScreenWidth){
  if(!className){
    return false;
  }
  const step = window.innerWidth > screenWidth ? 8 : 12;
  const chunk =  window.innerWidth > screenWidth ? 3 :2;
  // 变化时改变栅格布局
  return new Promise((resolve => {
    setTimeout(() => {
      //  select、 form 的 dom节点
      const items = document.getElementsByClassName(className);
      if ([...items].length <= 0) {
        return false;
      };
      const selectDom = items[0].querySelector('.ant-select-selector')
      const formDom = selectDom.closest('form');
      // 元素List
      const multipleEles = selectDom.querySelectorAll(".ant-select-selection-overflow-item");
      // form 表单中 三等分的大小
      const itemWidth = formDom.offsetWidth / chunk;
      // 内容区域大小 减掉padding
      const minContentWidth = itemWidth - (isEn ? 144 : 108) - 50;
      // 最大的内容宽度
      const maxContentWidth = minContentWidth + itemWidth * (chunk -1)
      // 子元素总宽度
      let totalWidth = 0;
      for (let i = 0, len = multipleEles.length || 0; i < len; i = i + 1 || 0) {
        totalWidth += multipleEles[i].offsetWidth;
      }

      // 最小情况
      if (totalWidth === 0 || totalWidth < minContentWidth) {
        resolve({ span: step });
        return false;
      }
      if(chunk === 2){
        // 最大情况：判断是否可以向右延伸
        resolve({ span: 24 })
      } else {
        // 布局为三列， 右侧剩余位置
        // 最大情况：判断是否可以向右延伸
        if (totalWidth > maxContentWidth || totalWidth > (minContentWidth + itemWidth)){
          resolve({ span: 24 })
        } else {
          // 剩下的情况，就是三等分占比两份的情况
          resolve({ span: 16 })
        }
      }
    }, time);
  }))
}
