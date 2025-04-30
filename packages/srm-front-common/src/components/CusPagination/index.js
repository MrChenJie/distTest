import React, { Component } from 'react';
import { Input } from 'antd';
import CusSelect from '@/components/CusSelect';
import pageArrow from '@/assets/pageArrow.svg';
import pageDisArrow from '@/assets/pageDisArrow.svg';
import intl from 'utils/intl';
import './index.less';

const PageOmit = (props) => {
  return (
    <li title={props.title} onClick={props.onClick && props.onClick}>
      ...
    </li>
  );
};

/**
 * 客制化分页器
 * onChange: ({ current, pageSize, total }) => {}, //页码跳转回调
 * current: 1, // 当前分页数
 * showQuickJumper: true, //是否展示快速跳转输入框
 * showSizeChanger: true, //是否展示页数变更
 * showTotal: true, // 是否展示总条数
 * pageSize: 10, // 每页条数
 * pageSizeSelections: ['10', '20', '30', '40'], // 页数变更数组
 * hideOnSinglePage: true, // 只有一页时是否隐藏分页器
 */
export default class PageComponent extends Component {
  static defaultProps = {
    onChange: ({ current, pageSize, total }) => {}, //页码跳转回调
    current: 1, // 当前分页数
    showQuickJumper: true, //是否展示快速跳转输入框
    showSizeChanger: true, //是否展示页数变更
    showTotal: true, // 是否展示总条数
    pageSize: 10, // 每页条数
    pageSizeSelections: ['10', '20', '30', '50'], // 页数变更数组
    hideOnSinglePage: true, // 只有一页时是否隐藏分页器
  };

  numPage = 9;
  crossPage = 4;

  constructor(props) {
    super(props);
    this.state = {
      total: props.total || 1, // 总条数
      pageSize: props.pageSize,
      totalPageSize: Math.ceil(props.total / props.pageSize) || 1, // 总分页数
      current: props.current, // 当前页数
      inputValue: '', //快速跳转输入框值
    };

    this.pageConRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      total: nextProps.total,
      pageSize: nextProps.pageSize,
      totalPageSize: Math.ceil(nextProps.total / nextProps.pageSize) || 1,
      current: nextProps.current,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => { this.setState({})});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => { this.setState({})});
  }

  // 页码改变时
  pageChange = (current) => {
    const { current: stateCurrentPage, pageSize, total } = this.state;
    if (current === stateCurrentPage) return;
    this.setState({ current });
    this.props.onChange.call(undefined, { current, pageSize: +pageSize, total });
  };

  //下一页事件
  nextPageChange = () => {
    let { current, totalPageSize } = this.state;
    if (current === totalPageSize) return;
    this.pageChange(current + 1);
  };

  //上一页事件
  prePageChange = () => {
    let { current } = this.state;
    if (current === 1) return;
    this.pageChange(current - 1);
  };

  //向前5页的省略号事件
  preOmitPageChange = () => {
    const { current } = this.state;
    if(current - 5 < 1){
      this.pageChange(1);
      return false;
    }
    this.pageChange(current - 5);
  };

  //向后5页的省略号事件
  nextOmitPageChange = () => {
    const { current, totalPageSize } = this.state;
    if(current + 5 > totalPageSize) {
      this.pageChange(totalPageSize);
      return false;
    }
    this.pageChange(current + 5);
  };

  //初始化分页元素
  initPage = (numPage = 9, crossPage = 4 ) => {
    const { nextBtnText, preBtnText } = this.props;
    const { totalPageSize, current } = this.state;
    let contentList = [];
    if (totalPageSize <= numPage) {
      contentList = Array.from({ length: totalPageSize }).map((_, i) => {
        return (
          <li
            onClick={() => this.pageChange(i + 1)}
            className={current === i + 1 ? 'customize-pagination-item-active' : ''}
            key={i + Math.random()}
          >
            {i + 1}
          </li>
        );
      });
    } else if (current + crossPage >= totalPageSize) {
      contentList = [
        <li
          key={'first' + Math.random()}
          onClick={() => {
            this.pageChange(1);
          }}
        >
          1
        </li>,
        <PageOmit
          key={'omit' + Math.random()}
          title={intl.get('hzero.common.cusView.message.forwardFivePages').d('向前5页')}
          onClick={this.preOmitPageChange}
        />,
      ].concat(
        Array.from({ length: numPage - 2 }).map((_, i) => {
          return (
            <li
              onClick={() => this.pageChange(i + totalPageSize - numPage + 3)}
              className={
                current === i + totalPageSize - numPage + 3 ? 'customize-pagination-item-active' : ''
              }
              key={i + Math.random()}
            >
              {i + totalPageSize - numPage + 3}
            </li>
          );
        })
      );
    } else if (current - crossPage <= 1) {
      contentList = Array.from({ length: numPage - 2 })
        .map((_, i) => {
          return (
            <li
              onClick={() => this.pageChange(i + 1)}
              className={current === i + 1 ? 'customize-pagination-item-active' : ''}
              key={i + Math.random()}
            >
              {i + 1}
            </li>
          );
        })
        .concat([
          <PageOmit
            key={'omit' + Math.random()}
            title={intl.get('hzero.common.cusView.message.backwardFivePages').d('向后5页')}
            onClick={this.nextOmitPageChange}
          />,
          <li
            key={'last' + Math.random()}
            onClick={() => {
              this.pageChange(totalPageSize);
            }}
          >
            {totalPageSize}
          </li>,
        ]);
    } else {
      // eslint-disable-next-line no-sparse-arrays
      contentList = [
        <li key={'first' + Math.random()} onClick={() => this.pageChange(1)}>
          1
        </li>,
        <PageOmit
          key={'omit' + Math.random()}
          title={intl.get('hzero.common.cusView.message.forwardFivePages').d('向前5页')}
          onClick={this.preOmitPageChange}
        />,
        ...Array.from({ length: numPage - 4 }).map((_, i) => {
          return (
            <li
              onClick={() => this.pageChange(i + current - Math.floor(crossPage / 2))}
              className={current === i + current - Math.floor(crossPage / 2) ? 'customize-pagination-item-active' : ''}
              key={i + Math.random()}
            >
              {i + current - Math.floor(crossPage / 2)}
            </li>
          );
        }),
        <PageOmit
          key={'omit' + Math.random()}
          title={intl.get('hzero.common.cusView.message.backwardFivePages').d('向后5页')}
          onClick={this.nextOmitPageChange}
        />,
        <li key={'last' + Math.random()} onClick={() => this.pageChange(totalPageSize)}>
          {totalPageSize}
        </li>,
      ];
    }

    contentList.unshift(
      <li className={current === 1 ? 'disabled' : ''} onClick={this.prePageChange} key={'pre'}>
        {preBtnText ? (
          preBtnText
        ) : (
          <img src={current === 1 ? pageDisArrow : pageArrow} alt="arrow" />)}
      </li>
    );
    contentList.push(
      <li
        className={current === totalPageSize ? 'disabled' : ''}
        onClick={this.nextPageChange}
        key={'next'}
      >
        {nextBtnText ? (
          nextBtnText
        ) : (
          <img style={{ transform: 'rotate(180deg)' }} src={current === totalPageSize ? pageDisArrow : pageArrow} alt="arrow" />
        )}
      </li>
    );

    return contentList;
  };

  //快速跳转输入框绑定
  inputChangeHandler = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  //快速跳转输入框按下回车事件
  onInputKeyUp = (event) => {
    if (event.keyCode === 13) {
      //keyCode为13就是回车
      const value = parseInt(event.target.value);
      const { current, totalPageSize, pageSize, total } = this.state;
      if (isNaN(value)) {
        this.setState({
          inputValue: '',
        });
      } else if (value > totalPageSize) {
        //如果输入的合法数字大于总页数，则跳转至最后一页
        if (totalPageSize === current) {
          //如果当前已经是最后一页，则只清空输入框
          this.setState({ inputValue: '' });
        } else {
          this.setState({ current: totalPageSize, inputValue: '' });
          this.props.onChange.call(undefined, { current: totalPageSize, pageSize: +pageSize, total });
        }
      } else if (value < 1) {
        //如果输入的合法数字大于总页数，则跳转至最后一页
        if (1 === current) {
          //如果当前已经是第一页，则只清空输入框
          this.setState({ inputValue: '' });
        } else {
          this.setState({ current: 1, inputValue: '' });
          this.props.onChange.call(undefined, { current: 1, pageSize: +pageSize, total });
        }
      } else if (this.state.current === value) {
        this.setState({ inputValue: '' });
      } else {
        this.setState({
          inputValue: '',
          current: value,
        });
        this.props.onChange.call(undefined, { current: value, pageSize: +pageSize, total });
      }
    }
  };

  pageSizeChange = (value) => {
    const { current, pageSize, total } = this.state;
    if (pageSize === parseInt(value)) {
      return false;
    } else {
      const totalPageSize = Math.ceil(total / value);
      this.setState({
        pageSize: value,
        totalPageSize,
      });
      this.props.onChange.call(undefined, {
        current: current > totalPageSize ? totalPageSize : current,
        pageSize: +value,
        total,
      });
    }
  };

  dealOptions = (list) => {
    return list.map((item) => ({
      value: item,
      meaning: intl.get('hzero.common.cusPagination.size.change', { size: item }).d('{size}/页'),
    }));
  };

  // 计算容器宽度减少分页个数
  computeWidth = () => {
    const parent = this.pageConRef.current;
    if(parent){
      let containerWidth = 0
      const totalWidth = parent.offsetWidth;
      for (let i = 0; i < parent.children.length; i++ ){
        containerWidth+=parent.children[i].offsetWidth
      }
      // offsetWidth 不包括 margin 的宽度，需要手动加上
      containerWidth+=40;
      while (totalWidth < containerWidth){
        if(this.numPage === 5){
          break;
        }
        this.numPage-=2;
        this.crossPage-=1;
        containerWidth-=80; // 每次减少两个页数，80px
      }
      // 空余空间大于80时，增加两个分页数
      while (totalWidth - containerWidth > 80 ){
        if(this.numPage === 9){
          break;
        }
        this.numPage+=2;
        this.crossPage+=1;
        containerWidth+=80; // 每次增加两个页数，80px
      }
    }
    return { numPage: this.numPage, crossPage: this.crossPage }
  }

  render() {
    const { inputValue, total, totalPageSize, pageSize } = this.state;
    const { showQuickJumper, showSizeChanger, showTotal, hideOnSinglePage } = this.props;
    const pageSizeSelections = this.dealOptions(this.props.pageSizeSelections);
    const { numPage, crossPage } = this.computeWidth();
    // 当分页数在最小10条每页时，且只有一页数据时，默认隐藏分页器
    if (hideOnSinglePage && totalPageSize === 1 && pageSize === 10) {
      return false;
    } else {
      return (
        <div className="customize-pagination-container" ref={this.pageConRef}>
          <div className="customize-pagination-wrapper">
            <ul>{this.initPage(numPage, crossPage)}</ul>
          </div>
          {showQuickJumper && (
            <div className="qucik-jump-wrapper">
              <span>{intl.get('hzero.common.cusView.message.goTo').d('前往')}</span>
              <Input
                onKeyUp={this.onInputKeyUp}
                value={inputValue}
                onChange={this.inputChangeHandler}
              />
            </div>
          )}
          {showSizeChanger && (
            <div className="size-changer-wrapper">
              <CusSelect
                optionLabelProp="label"
                placeholder=""
                defaultValue={intl.get('hzero.common.cusPagination.size.change', { size: pageSize }).d('{size}/页')}
                value={intl.get('hzero.common.cusPagination.size.change', { size: pageSize }).d('{size}/页')}
                style={{ width: '100%' }}
                options={pageSizeSelections}
                onChange={this.pageSizeChange}
              />
            </div>
          )}
          {showTotal && (
            <span style={{ marginLeft: `8px`, color: '#646A73', height: '32px', lineHeight: '31px' }}>
              {intl
                .get('hzero.common.cusView.message.total', {
                  total: total,
                })
                .d('共{total}条')}
            </span>
          )}
        </div>
      );
    }
  }
}
