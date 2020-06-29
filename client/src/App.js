import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css'
import {  Typography, Tabs, List, Avatar, Affix, Modal } from 'antd'

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = { apiResponse: null, modalVisible: false, selectedItem: null, selectedTab: 0 };

    this.tabsCallback = this.tabsCallback.bind(this)
  }

  callAPI() {
    fetch("http://192.168.0.102:9000/menu"+window.location.pathname)
        .then(res => res.json())
        .then(res => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
      this.callAPI();
  }

  tabsCallback(key) {
    this.setState({ selectedTab: key });
  }

  render() {

    const { Paragraph } = Typography
    const { TabPane } = Tabs;
  
    return (
      <div>
        {/* { this.state.apiResponse ? JSON.stringify(this.state.apiResponse.groups[0]) : "" } */}
        { this.state.apiResponse ?
          <div>
          <div style={{ background: "#F4F5F6" }}>
              <Affix> 
                  <div style={{ background: "#F4F5F6", paddingTop: "10px", paddingLeft: "10px", paddingRight: "10px"  }}>
                      <h1 className="place-name">{this.state.apiResponse.store.name}</h1>
                  </div>
                  {/* <div style={{ background: "#F4F5F6", paddingLeft: this.state.apiResponse.groups.length > 4 ? "0px" : "10px", paddingRight: this.state.apiResponse.groups.length > 4 ? "0px" : "10px" }}> */}
                  <div style={{ background: "#F4F5F6", marginLeft: "10px", marginRight: "10px" }}>
                      <Tabs tabPosition='top' type='line' onChange={this.tabsCallback}>
                          {this.state.apiResponse.groups.map((group, index) => (
                              <TabPane tab={group.name} key={index} />
                          ))}
                      </Tabs>
                  </div>
              </Affix>
          </div>
          <List
              itemLayout="horizontal"
              dataSource={this.state.apiResponse.groups[this.state.selectedTab].commodities}
              style={{ paddingLeft: "10px", paddingRight: "10px"  }}
              renderItem={item => (
              <List.Item onClick={() => { this.setState({modalVisible: true}); this.setState({selectedItem: item}) } }>
                  <div style={{ width: "100%" }}>
                      { item.img ?
                        <div>
                          <div style={{ width: "110px", float: "left" }}>
                            <Avatar shape="square" size={100} src={item.img} />
                          </div>
                          <div style= {{ width: "calc(100% - 110px)", marginLeft: "110px" }}>
                            <Paragraph>
                                <h4>{item.name}</h4>
                            </Paragraph>
                            { item.description ?
                              <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                                { item.description }
                              </Paragraph> : ''
                            }
                            <Paragraph>
                                <h4>{item.price} ₴</h4>
                            </Paragraph>
                          </div>
                        </div>
                         : 
                        <div>
                          <Paragraph>
                                <h4>{item.name}</h4>
                            </Paragraph>
                            { item.description ?
                              <Paragraph ellipsis={{ rows: 2, expandable: false }}>
                                { item.description }
                              </Paragraph> : ''
                            }
                            <Paragraph>
                                <h4 style={{lineHeight: "25px"}}>{item.price} ₴</h4>
                            </Paragraph>
                        </div>
                      }
                  </div>
              </List.Item>
              )}
            />
            <Modal
                footer={null}
                centered
                visible={ this.state.modalVisible }
                onCancel={() => this.setState({modalVisible: false}) }>
                    { this.state.selectedItem ?
                        <div>
                          {
                            this.state.selectedItem.img ?
                            <img 
                                style={{ margin: "auto", display: "block", width: "100%", maxHeight: "400px", padding: 20, objectFit: "contain" }}
                                alt="example" src={ this.state.selectedItem.img } 
                            /> : ''
                          }
                          <Paragraph>
                              <h4 style={{lineHeight: "25px"}}>{this.state.selectedItem.name}</h4>
                          </Paragraph>
                          <Paragraph>
                              { this.state.selectedItem.unit } { this.state.selectedItem.unitType }
                          </Paragraph>
                          <Paragraph>
                              { this.state.selectedItem.description }
                          </Paragraph>
                          <Paragraph>
                              <h4 style={{lineHeight: "25px"}}>{this.state.selectedItem.price} ₴</h4>
                          </Paragraph>
                        </div> : ''
                    }
              </Modal>
          </div> : ''
        }
      </div>
    )
    return (
      <div className="App">
        <p className="App-intro">{this.state.apiResponse}</p>
      </div>
    );
  }
}

export default App;
