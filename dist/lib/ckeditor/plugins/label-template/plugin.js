/**
 * TODO: only for placeholder, avoid error request
 * @author WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/13
 * @copyright 2019 ® HAND
 */

const prevPlugin = CKEDITOR.plugins.get('label-template');
// 不存在/占位初始化
if (!prevPlugin) {
  CKEDITOR.plugins.add('label-template', {
    init: function (editor) {
      //Plugin logic goes here.
    },
    labelTemplateIsInit: false,
  });
}
