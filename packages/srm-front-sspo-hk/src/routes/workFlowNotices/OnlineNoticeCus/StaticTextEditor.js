/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-08-21 14:10:32
 * Copyright (c) 2023, All Rights Reserved. 
 */
/* eslint-disable react/no-unused-state */
// TODO: state.content 本组件没有使用, 但是 ./index.js 中使用了
/**
 * StaticTextEditor.js
 * 本质上 TinymceEditor 是不受控的, 之前这里写错了, 一直没有更新 content 但是 编辑器里面还是有值
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import RichTextEditor from '@/routes/ContractMaintain/components/RichTextEditor';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class StaticTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.staticTextEditor = React.createRef();
    this.state = {
      editorKey: uuid(),
      content: props.content,// 编辑器内容
      prevContent: props.content, // 保存用来比较编辑内容是否改变
      newContent: props.newContent, // 语言选择内容
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { content } = nextProps;
    if (content !== prevState.prevContent) {
      return {
        editorKey: uuid(),
        content: content || '',
        prevContent: content || '',
      };
    }
    return null;
  }

  @Bind()
  changeScroll () {
    let iframe = document.getElementById(this.state.editorKey).getElementsByTagName('iframe')
    if (iframe.length > 0) {
      const editorContainerDoc = iframe[0].contentDocument || iframe[0].contentWindow.document
      let head = editorContainerDoc?.querySelector('head');
      let styleChildren = head?.querySelectorAll('style')
      let lastStyle = styleChildren[styleChildren.length - 1]
      const cssRules = [
        {
          selector: '::-webkit-scrollbar-track-piece',
          styles: {
            'background-color': 'transparent',
            'border-radius': '4px'
          }
        },
        {
          selector: '::-webkit-scrollbar-thumb',
          styles: {
            'background-color': '#dee0e3',
            'border-radius': '4px',
            // 'background-color': 'transparent',
          }
        },
        {
          selector: '::-webkit-resizer, ::-webkit-scrollbar-corner',
          styles: {
            'background-color': 'transparent'
          }
        },
        {
          selector: '::-webkit-scrollbar',
          styles: {
            width: '8px',
            height: '8px',
            // 'background-color': 'transparent',
          }
        },
      ]
      // 将 CSS 规则转换为文本
      const cssText = cssRules.map((rule) => {
        const styles = Object.entries(rule.styles).map(([key, value]) => `${key}: ${value}`).join('; ');
        return `${rule.selector} { ${styles} }`;
      }).join('\n');
      lastStyle.innerHTML = cssText
    }
  }
  @Bind()
  changeScrollH () {
    let iframe = document.getElementById(this.state.editorKey).getElementsByTagName('iframe')
    if (iframe.length > 0) {
      const editorContainerDoc = iframe[0].contentDocument || iframe[0].contentWindow.document
      let head = editorContainerDoc?.querySelector('head');
      let styleChildren = head?.querySelectorAll('style')
      let lastStyle = styleChildren[styleChildren.length - 1]
      const cssRules = [
        {
          selector: '::-webkit-scrollbar-track-piece',
          styles: {
            'background-color': 'transparent',
            'border-radius': '4px'
          }
        },
        {
          selector: '::-webkit-scrollbar-thumb',
          styles: {
            // 'background-color': '#dee0e3',
            'border-radius': '4px',
            'background-color': 'transparent',
          }
        },
        {
          selector: '::-webkit-resizer, ::-webkit-scrollbar-corner',
          styles: {
            'background-color': 'transparent'
          }
        },
        {
          selector: '::-webkit-scrollbar',
          styles: {
            width: '8px',
            height: '8px',
            'background-color': 'transparent',
          }
        },
      ]
      // 将 CSS 规则转换为文本
      const cssText = cssRules.map((rule) => {
        const styles = Object.entries(rule.styles).map(([key, value]) => `${key}: ${value}`).join('; ');
        return `${rule.selector} { ${styles} }`;
      }).join('\n');
      lastStyle.innerHTML = cssText
    }
  }

  render() {
    const { isDisabled } = this.props;
    const { editorKey, prevContent } = this.state;
    return (
      <div className={styles['staticBorder']}>
        <div id={editorKey} onMouseEnter={this.changeScroll} onMouseLeave={this.changeScrollH}>
          <RichTextEditor
            key={editorKey}
            ref={this.staticTextEditor}
            content={prevContent}
            config={{ height: 500 }}
            onEditorChange={this.handleEditChange}
            readOnly={isDisabled}
          />
        </div> 
      </div>
    );
  }

  @Bind()
  handleEditChange(dataSource) {
    const {newContent} = this.state;
    const {onEditChange = (e) => e} = this.props;
    onEditChange(dataSource, newContent)
  }
}
