import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './index.less'
import {useEffect, useState, useRef } from "react";

export default function Editor({ defaultValue, onChange, disabledValue, editorKey }) {
  const [editorValue, setEditorValue] = useState(defaultValue);
  const [disabled, setDisabled] = useState(disabledValue);
  const [keyId, setkeyId] = useState(editorKey);
  const formatTimeout  = useRef(null);

  // 字体生效代码
  const Font = ReactQuill.Quill.import('formats/font');
  Font.whitelist = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];
  ReactQuill.Quill.register(Font, true);

  // 工具栏各个工具的悬浮提示
  const titleConfig = {
    '.ql-bold': '加粗',
    '.ql-color': '颜色',
    '.ql-font': '字体',
    '.ql-code': '插入代码',
    '.ql-italic': '斜体',
    '.ql-link': '添加链接',
    '.ql-background': '背景颜色',
    '.ql-size': '字号',
    '.ql-strike': '删除线',
    '.ql-script[value="super"]': '上标',
    '.ql-script[value="sub"]': '下标',
    '.ql-underline': '下划线',
    '.ql-blockquote': '引用',
    '.ql-header': '标题',
    '.ql-expanded': '标题',
    '.ql-code-block': '代码块',
    '.ql-list[value="ordered"]': '有序列表',
    '.ql-list[value="bullet"]': '无序列表',
    '.ql-list[value="check"]': '事项列表',
    '.ql-indent[value="+1"]': '增加缩进',
    '.ql-indent[value="-1"]': '减少缩进',
    '.ql-direction': '文本方向',
    '.ql-align': '对齐方式',
    '.ql-formula': '插入公式',
    '.ql-image': '插入图片',
    '.ql-video': '插入视频',
    '.ql-clean': '清除字体样式',
  };

  const quillRef = useRef(null);
  useEffect(() => {
    handleChange(defaultValue)
    setTimeout(() => { addTitle() }, 100); // 监听文本变化,给工具栏添加属性
  }, [defaultValue]);

  useEffect(() => {
    // 添加点击事件监听器
    const handleLinkClick = (event) => {
      const target = event.target;
      if (target.tagName === 'A') {
        event.preventDefault(); // 阻止默认行为
        window.open(target.href, '_blank'); // 在新标签页中打开链接
      }
    };
    const editorElement = document.querySelector(`#${keyId}`);
    editorElement.addEventListener('click', handleLinkClick);
    // 清理事件监听器
    return () => {
      editorElement.removeEventListener('click', handleLinkClick);
    };
  }, []);
  
  const handleChange = (content, delta, source, editor) => {
    const quill = quillRef.current?.getEditor();
    const newContent = quill?.root?.innerHTML?.trim();
    if (newContent === '<p class="ql-align-right"><br></p>' || newContent === '<p class="ql-align-center"><br></p>') {
      quill.root.innerHTML = ''; // 清空编辑器内容
      setEditorValue('');
      onChange('');
    } else {
      setEditorValue(content);
      onChange(content);
    }
    if (source === 'user' && delta && delta.ops) {
      if (formatTimeout.current) {
        clearTimeout(formatTimeout.current);
      }
      // 下面一段是给重新编辑的内容加底色和高亮，暂时注释不上线
      // 设置新的格式化定时器
      // formatTimeout.current = setTimeout(() => {
      //   let position = 0; // 记录当前处理的位置
      //   delta.ops.forEach((op) => {
      //     if (op.retain) {
      //       position += op.retain;
      //     } else if (op.insert && typeof op.insert === 'string') {
      //       const highlightText = op.insert;
      //       const highlightLength = highlightText.length;
      //       if (highlightLength > 0) {
      //         quill.formatText(position, highlightLength, 'color', 'red');
      //         quill.formatText(position, highlightLength, 'background', '#ffcc00');
      //       }
      //       position += highlightLength;
      //     } else if (op.delete) {
      //       position -= op.delete;
      //     }
      //   });
      // }, 200); // 延迟200毫秒进行格式化
    }
  };

  // 给工具栏添加悬浮提示
  const addTitle = () => {
    // 获取工具栏的容器元素
    const toolbar = document.querySelector('.ql-toolbar');
    if (toolbar) {
      // 遍历配置对象的键值对
      for (let key in titleConfig) {
        if (titleConfig.hasOwnProperty(key)) {
          // 获取对应的按钮元素
          const button = toolbar.querySelector(key);
          // 判断是否存在
          if (button) {
            // 给按钮元素添加 title 属性，值为配置对象的值
            button.title = titleConfig[key];
          }
        }
      }
    }
  };

  return (
    <div id={keyId}>
      <ReactQuill
        ref={quillRef}
        bounds={document.body}
        modules={{
          toolbar: [
            [{ font: ['SimSun', 'SimHei','Microsoft-YaHei','KaiTi','FangSong','Arial','Times-New-Roman','sans-serif'] }], // 字体
            [{ script: 'sub'}, { script: 'super' }],         // 上标 下标
            [{ direction: 'rtl' }],                          // 文本方向
            ["bold", "italic", "underline", "strike"],       // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"],                    // 引用  代码块
            [{ list: "ordered" }, { list: "bullet" }, { 'list': 'check' }], // 有序、无序、选择列表
            [{ indent: "-1" }, { indent: "+1" }],            // 缩进
            [{ size: ["small", false, "large", "huge"] }],   // 字体大小
            [{ header: [1, 2, 3, 4, 5, 6, false] }],         // 标题
            [{ color: [] }, { background: [] }],             // 字体颜色、字体背景颜色
            [{ align: [] }],                                 // 对齐方式
            ["clean"],                                       // 清除文本格式
            // ["link"]                                         // 链接
            // ["link", "image", "video"]                       // 链接、图片、视频
          ],
        }}
        value={editorValue}
        onChange={handleChange}
        theme="snow"
        readOnly={disabledValue}
        className={disabledValue && 'disabledEdit'}
        // placeholder="请输入内容"
      />
    </div>
  );
}