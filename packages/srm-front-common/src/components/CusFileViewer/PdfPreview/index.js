import React, { PureComponent } from 'react';
import './index.less';
import { Icon } from 'hzero-ui';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;

import CusSpin from '@/components/CusSpin';
import CusModal from '@/components/CusModal';
import CusInput from '@/components/CusInput';

export default class PdfPreview extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageNumber: 1,
      pageNumberInput: 1,
      pageNumberFocus: false,
      numPages: 1,
      pageWidth: 650,
    };
  }

  passwordCallBack = () => {};
  password = '';
  passwordResponses = '';

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages: numPages });
  };

  lastPage = () => {
    if (this.state.pageNumber == 1) {
      return;
    }
    const page = this.state.pageNumber - 1;
    this.setState({ pageNumber: page, pageNumberInput: page });
  };
  nextPage = () => {
    if (this.state.pageNumber == this.state.numPages) {
      return;
    }
    const page = this.state.pageNumber + 1;
    this.setState({ pageNumber: page, pageNumberInput: page });
  };
  onPageNumberFocus = () => {
    this.setState({ pageNumberFocus: true });
  };
  onPageNumberBlur = () => {
    this.setState({
      pageNumberFocus: false,
      pageNumberInput: this.state.pageNumber,
    });
  };
  onPageNumberChange = (e) => {
    let value = e.target.value;
    value = value <= 0 ? 1 : value;
    value = value >= this.state.numPages ? this.state.numPages : value;
    this.setState({ pageNumberInput: value });
  };
  toPage = (e) => {
    if (e.keyCode === 13) {
      this.setState({ pageNumber: Number(e.target.value) });
    }
  };

  pageZoomOut = () => {
    if (this.state.pageWidth <= 503) {
      return;
    }
    const pageWidth = this.state.pageWidth * 0.8;
    this.setState({ pageWidth: pageWidth });
  };
  pageZoomIn = () => {
    const pageWidth = this.state.pageWidth * 1.2;
    this.setState({ pageWidth: pageWidth });
  };

  pageFullscreen = () => {
    this.setState({ pageWidth: 650 });
  };

  render() {
    const { filePath, isPageTool = true, onClosePreview } = this.props;
    const {
      pageNumber,
      pageWidth,
      numPages,
      pageNumberInput,
      pageNumberFocus,
      passwordVisible = false,
    } = this.state;
    return (
      <>
        <div className="pdf-view">
          <Document
            file={filePath}
            onLoadSuccess={this.onDocumentLoadSuccess}
            onPassword={(callback, reason) => {
              this.passwordCallBack = callback;
              this.passwordResponses =
                reason === 1
                  ? intl.get('hzero.common.message.enter.password').d('Enter the password to open this PDF file.')
                  : intl.get('hzero.common.message.invalid.password').d('Invalid password. Please try again.');
              this.setState({
                passwordVisible: true,
              });
            }}
            loading={
              <div style={{ paddingTop: '200px', paddingLeft: '140px' }}>
                <CusSpin spinning={true} />
              </div>
            }
            options={{
              cMapUrl: `/cmaps/`,
              cMapPacked: true,
            }}
          >
            <Page pageNumber={pageNumber} width={pageWidth} loading={'loading...'} />
          </Document>
          {isPageTool && (
            <div className="page-tool">
              <div className="page-tool-item" onClick={this.lastPage}>
                <Icon type="step-backward" />
              </div>
              <div className="page-tool-item" onClick={this.nextPage}>
                <Icon type="step-forward" />
              </div>
              <div className="page-input">
                <input
                  value={pageNumberFocus ? pageNumberInput : pageNumber}
                  onFocus={this.onPageNumberFocus}
                  onBlur={this.onPageNumberBlur}
                  onChange={this.onPageNumberChange}
                  onKeyDown={this.toPage}
                  type="number"
                />
                {` /${numPages}`}
              </div>
              <div className="page-tool-item" onClick={this.pageZoomIn}>
                <Icon type="plus" />
              </div>
              <div className="page-tool-item" onClick={this.pageZoomOut}>
                <Icon type="minus" />
              </div>
              <div className="page-tool-item" onClick={this.pageFullscreen}>
                <Icon type="sync" />
              </div>
            </div>
          )}
        </div>
        <CusModal
          title={intl.get('hzero.common.cusModal.title.password').d('Tips')}
          visible={passwordVisible}
          onCancel={() => {
            this.setState({
              passwordVisible: false,
            });
            onClosePreview();
          }}
          onOk={() => {
            this.setState({
              passwordVisible: false,
            });
            this.passwordCallBack(this.password);
          }}
        >
          {this.passwordResponses}
          <div className="cus-ant-input">
            <CusInput
              onChange={(password) => {
                this.password = password;
              }}
            />
          </div>
        </CusModal>
      </>
    );
  }
}
