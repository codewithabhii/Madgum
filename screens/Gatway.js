import React, { Component } from 'react'
import { Image, StyleSheet, ScrollView, TextInput, View, TouchableOpacity, Modal, WebView, ActivityIndicator} from 'react-native'
import Slider from 'react-native-slider';
import { Icon } from "expo";
import { Divider, Button, Block, Text, Switch } from '../components';
import { theme, mocks } from '../constants';
import * as firebase from 'firebase';

class Gatway extends Component {
  state={
    showModal:false,
    ORDER_ID:"",
    TXN_AMOUNT:"",
    CUST_ID:"",
    REQUESTID:""
};

  componentDidMount() {
    const { navigation } = this.props;
    const AMOUNTTOPAY = navigation.getParam("AMOUNTTOPAY", "NO-ID");
    const REQUESTID = navigation.getParam("REQUESTID", "NO-ID");
    this.setState({ CUST_ID: firebase.auth().currentUser.uid});
    this.setState({TXN_AMOUNT:  AMOUNTTOPAY});
    this.setState({REQUESTID});
  }

  invokeWebViewModal=()=>{
    const uuidv1 = require('uuid/v1');
    this.setState({ORDER_ID :uuidv1()});
    this.setState({showModal :true});
  }

  responseFromPaytm=(paymentStatus)=>{
    if(paymentStatus ==='true'){
      this.updatedPaymentStatus();
    }
  }

  updatedPaymentStatus=()=>{
    firebase.database().ref().child('CollectionTable/USERSWHOHASTOPAY'+this.state.CUST_ID+'/').update({
      PAIDSTATUS : true,
      PAYMENTMODE:'Paytm'
    }).then(()=>{
      }).catch((error)=>{console.log(error)});
    }

  render() {
    let {showModal, ORDER_ID, TXN_AMOUNT, CUST_ID} =this.state;
    return (
      <Block>
        <Block flex={false} row center space="between" style={styles.header}>
          <Text h1 bold>Payment</Text>
          <Button>
          </Button>
        </Block>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Block style={styles.inputs}>
           <Text>Choose a payment method you'd like to proceed with</Text>
          </Block>
          <Divider margin={[theme.sizes.base, theme.sizes.base * 2]} />

          <Block style={styles.sliders}>
          <TouchableOpacity style={styles.card} onPress={() => this.invokeWebViewModal()}>
            <View style={styles.row} >   
            <Image source={{ uri:"https://img.icons8.com/color/48/000000/paytm.png"}} style={styles.pic} />
          </View>
         </TouchableOpacity> 
         <View style={styles.row} >
            <Image source={{ uri:"https://img.icons8.com/dusk/64/000000/google-pay.png"}} style={styles.pic} />
         </View>
          </Block>

        </ScrollView>
        <Modal
                visible={showModal}
                onRequestClose={()=> this.setState({showModal: false , backClick : true})}
                >
                    <WebView
                    source={{uri:'https://dry-bastion-88099.herokuapp.com/api/paytm/request'}}
                    injectedJavaScript={`document.getElementById('ORDER_ID').value="${ORDER_ID}";document.getElementById('TXN_AMOUNT').value="${TXN_AMOUNT}";document.getElementById('CUST_ID').value="${CUST_ID}";document.f1.submit()`}
                    onNavigationStateChange={data=>{this.responseFromPaytm(data.title)}}
                    renderLoading={()=>{return(<ActivityIndicator style = {{position: 'absolute',left: 0,right: 0, top: 0,bottom: 0,alignItems: 'center',justifyContent: 'center'}} size="large" color="#e89d09"/>)}}
                    startInLoadingState
                    />
                </Modal>
      </Block>
    )
  }
}

export default Gatway;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  avatar: {
    height: theme.sizes.base * 2.2,
    width: theme.sizes.base * 2.2,
  },
  inputs: {
    marginTop: theme.sizes.base * 0.7,
    paddingHorizontal: theme.sizes.base * 2,
  },
  inputRow: {
    alignItems: 'flex-end'
  },
  sliders: {
    marginTop: theme.sizes.base * 0.7,
    paddingHorizontal: theme.sizes.base * 2,
  },
  thumb: {
    width: theme.sizes.base,
    height: theme.sizes.base,
    borderRadius: theme.sizes.base,
    borderColor: 'white',
    borderWidth: 3,
    backgroundColor: theme.colors.secondary,
  },
  toggles: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
    justifyContent: 'space-between',

  },
  pic: {
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 15,
  },
  amountTxt:{
    fontWeight: '600',
    color: 'red',
    fontSize: 15,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 13,
  },
  end: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontWeight: '400',
    color: '#666',
    fontSize: 12,

  },
  icon:{
    height: 28,
    width: 28, 
  },
  card:{
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
})
