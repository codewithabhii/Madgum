import React, { Component } from 'react'
import { Dimensions, Image, StyleSheet, ScrollView, TouchableOpacity, View} from 'react-native'

import { Card, Badge, Button, Block, Text } from '../components';
import { theme, mocks } from '../constants';

const { width } = Dimensions.get('window');
import { Icon } from "expo";
import * as firebase from 'firebase';

class Browse extends Component {
  state = {
    active: 'Balance',
    uid:'',
    categories: [],
    users:[],
    transactions:[],
    contributions:[],
    RemainingBalance:0,
    balances:[],
    currentUserName:'',
    currentUserSymbol:'',
    everythingLoaded : true,
    transactionImages:{
      cake:"https://img.icons8.com/cotton/64/000000/birthday-cake.png",
      fairwell:"https://img.icons8.com/color/48/000000/gift-card.png",
      travel:"https://img.icons8.com/color/50/000000/cycling-road.png",
      gift:"https://img.icons8.com/color/48/000000/christmas-gift.png",
      snacks:"https://img.icons8.com/cotton/64/000000/chips.png",
      other:""
    },
  }

  componentDidMount() {
    this.setState({ uid: firebase.auth().currentUser.uid});
    this.getRemainingBalance();
    this.getAllBalancesAndTransactions();
    this.getAllUserDetails();
    this.getAllContributions();
  }

 //CRUD Opertaions
 getAllUserDetails=()=>{
    const itemsRef = firebase.database().ref("Users/");
    itemsRef.on("value", snapshot => {
        let d = new Date();
        let items = snapshot.val();
        let allUsers = [];
        for(item in items){
          if(items[item].ID === this.state.uid){
            this.setState({currentUserName:items[item].USERNAME});
          }
          allUsers.push({
            ID:items[item].ID,
            NAME:items[item].USERNAME,
            DOB:d.getFullYear()+'/'+d.getMonth()+'/'+d.getDate(),
            IMAGE:""
          });
        }
        this.setState({users:allUsers});
        console.log("User data fetched successfully");
    }); 
  }

  getRemainingBalance=()=>{
    const itemsRef = firebase.database().ref("Calculator/BALANCES");
    itemsRef.on("value", snapshot => {
      let items = snapshot.val();
      let totalBalances = [];
        totalBalances.push({
          TOTALCOLLECTIONAMOUNT:items.TOTALCOLLECTIONAMOUNT,
          TOTALTRANSACTIONAMOUNT:items.TOTALTRANSACTIONAMOUNT,
       });
      this.setState({balances : totalBalances[0]});
      let resAmount = this.state.balances.TOTALCOLLECTIONAMOUNT -  this.state.balances.TOTALTRANSACTIONAMOUNT;
      this.setState({RemainingBalance : resAmount});
      console.log("Remaining balance fetched successfully");
  });
  }

  getAllBalancesAndTransactions=()=>{
    const itemsRef = firebase.database().ref("Calculator/TRANSACTIONS");
    itemsRef.on("value", snapshot => {
        let items = snapshot.val();
        let allTrans = [];
        for(item in items){
          allTrans.push({
            AMOUNTUSED:items[item].AMOUNTUSED,
            DESCRIPTION:items[item].DESCRIPTION,
            FOR:items[item].FOR,
            ID:items[item].ID,
            DATE:items[item].DATE,
          });
        }
        //Sorting done here
        allTrans.sort((a,b)=>{
          return new Date(b.DATE) - new Date(a.DATE);
        });
        this.setState({transactions:allTrans});
        console.log("Transactions data fetched successfully");
    }); 
  }

  getAllContributions=()=>{
    const itemsRef = firebase.database().ref("CollectionTable/");
    itemsRef.on("value", snapshot => {
        let items = snapshot.val();
        let allContri = [];
        for(item in items){
          allContri.push({
            REQUESTEDAMOUNT:items[item].REQUESTEDAMOUNT,
            DESCRIPTION:items[item].DESCRIPTION,
            FOR:items[item].FOR,
            REQUESTID:items[item].REQUESTID,
            DATE:items[item].DATE,
            PAIDSTATUS: items[item].USERSWHOHASTOPAY[this.state.uid] ? items[item].USERSWHOHASTOPAY[this.state.uid].PAIDSTATUS : "hide",
          });
        }
        this.setState({contributions:allContri});
        console.log("Contributions data fetched successfully");
    }); 
  }

  handleTab = tab => {
    const { categories } = this.props;
    const filtered = categories.filter(
      category => category.tags.includes(tab.toLowerCase())
    );

    this.setState({ active: tab, categories: filtered });
  }

  renderTab(tab) {
    const { active } = this.state;
    const isActive = active === tab;

    return (
      <TouchableOpacity
        key={`tab-${tab}`}
        onPress={() => this.handleTab(tab)}
        style={[
          styles.tab,
          isActive ? styles.active : null
        ]}
      >
        <Text size={16} medium gray={!isActive} secondary={isActive}>
          {tab}
        </Text>
      </TouchableOpacity>
    )
  }

  renderResults(){
    if(this.state.everythingLoaded){
      switch(this.state.active){
        case 'People': return this.displayPeople();
        case 'Balance': return this.displayBalanceAndTransactions();
        case 'Contributions': return this.displayContributions();
        default : return(<Text>No Results Found</Text>);
      }
    }
  }

//Tab Functions
  displayPeople=()=>{
    return(
      this.state.users.map(each=>(
        <Card center middle shadow key={each.ID} style={styles.category}>
        <Badge margin={[0, 0, 15]} size={50} color="#f2a18d">
          {/* <Image source={category.image} /> */}
          <Text>{this.getUserText(each.NAME)}</Text>
        </Badge>
        <Text medium height={20}>{each.NAME}</Text>
        <Text gray caption>{each.DOB}</Text>
      </Card>
      ))
    );
  }

  displayBalanceAndTransactions=()=>{
    return(
      <View>
        <View>
            <Text gray caption>Remaining balance</Text>
            <Text style={styles.balanceText}><Icon.FontAwesome name="rupee" size={50} color="#e96443" />{this.state.RemainingBalance}</Text>
            <Text gray caption>Recent purchases</Text>
        </View>
        <View>
          <ScrollView>
          {this.displayTransactions()}
          </ScrollView>
        </View>
      </View>
    );
  }

  displayTransactions=()=>{
    return(
      this.state.transactions.map((each)=>(
        <View style={styles.row} key={each.ID}>
        <Image source={{ uri: this.state.transactionImages[each.FOR]}} style={styles.pic} />
        <View>
          <View style={styles.nameContainer}>
            <Text style={styles.nameTxt}>{each.DESCRIPTION}</Text>
          </View>
          <View style={styles.end}>
            <Image style={[styles.icon, {marginLeft:15, marginRight:5, width:14, height:14}]} source={{uri:"https://img.icons8.com/color/48/000000/calendar.png"}}/>
            <Text style={styles.time}>{each.DATE}</Text>
          </View>
        </View>
        <Text style={styles.amountTxt}>-<Icon.FontAwesome name="rupee" size={15} color="red" />{each.AMOUNTUSED}</Text> 
      </View>
      ))
    );
  }

  displayContributions=()=>{
    return(
      this.state.contributions.map((each)=>(
        <TouchableOpacity style={styles.contri_card} key={each.REQUESTID}>
        <Image style={styles.contri_image} source={{uri: "https://img.icons8.com/dusk/64/000000/donate.png"}}/>
        <View style={styles.contri_cardContent}>
          <Text style={styles.contri_name}>{each.FOR}</Text>
          <Text gray caption>Posted on: {each.DATE}</Text>
          <Button style={styles.contri_followButton} gradient onPress={() => this.props.navigation.navigate('Gatway',{AMOUNTTOPAY:each.REQUESTEDAMOUNT,REQUESTID:each.REQUESTID})}>
      <Text bold white center>{each.PAIDSTATUS === 'hide' ? 'Paid ':'Pay '}<Icon.FontAwesome name="rupee" size={13} color="white" />{each.REQUESTEDAMOUNT}</Text>
         </Button>
        </View>
        </TouchableOpacity>
      ))
    );
  }

  //Sub functions
  getUserText=(username)=>{
    let result = '';
    let words = username.split(' ');
    result += words[0].charAt(0);
    if(words.length >= 2){
    result += words[1].charAt(0);
    }
    return result.toUpperCase();
  }

  render() {
    const { profile, navigation } = this.props;
    const { categories } = this.state;
    const tabs = ['Balance','People','Contributions','Updates'];

    return (
      <Block>
        <Block flex={false} row center space="between" style={styles.header}>
          <Text h1 bold>Hi, {this.state.currentUserName}</Text>
          {/* <Button onPress={() => navigation.navigate("Welcome")}>
            <Image
              source={profile.avatar}
              style={styles.avatar}
            />
          </Button> */}
        <Badge margin={[0, 0, 15]} size={40} color="#f2a18d">
          <Text>{this.getUserText(this.state.currentUserName)}</Text>
        </Badge>
        </Block>

        <Block flex={false} row style={styles.tabs}>
          {tabs.map(tab => this.renderTab(tab))}
        </Block>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingVertical: theme.sizes.base * 2}}
        >
          <Block flex={false} row space="between" style={styles.categories}>
              {this.renderResults()}
          </Block>
        </ScrollView>
      </Block>
    )
  }
}

Browse.defaultProps = {
  profile: mocks.profile,
  categories: mocks.categories,
}

export default Browse;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  avatar: {
    height: theme.sizes.base * 2.2,
    width: theme.sizes.base * 2.2,
  },
  tabs: {
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: theme.sizes.base,
    marginHorizontal: theme.sizes.base * 2,
  },
  tab: {
    marginRight: theme.sizes.base * 2,
    paddingBottom: theme.sizes.base
  },
  active: {
    borderBottomColor: theme.colors.secondary,
    borderBottomWidth: 3,
  },
  categories: {
    flexWrap: 'wrap',
    paddingHorizontal: theme.sizes.base * 2,
    marginBottom: theme.sizes.base * 3.5,
  },
  category: {
    // this should be dynamic based on screen width
    minWidth: (width - (theme.sizes.padding * 2.4) - theme.sizes.base) / 2,
    maxWidth: (width - (theme.sizes.padding * 2.4) - theme.sizes.base) / 2,
    maxHeight: (width - (theme.sizes.padding * 2.4) - theme.sizes.base) / 2,
  },
  balanceText:{
    fontSize:60,
    fontWeight:"100"
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
  contri_cardContent: {
    marginLeft:20,
    marginTop:10
  },
  contri_image:{
    marginTop:12,
    width:70,
    height:70,
    borderRadius:35,
    borderWidth:2,
    borderColor:"#f2a18d"
  },

  contri_card:{
    flex:1,
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,

    marginLeft: 10,
    marginRight: 10,
    // marginTop:20,
    backgroundColor:"white",
    padding: 10,
    flexDirection:'row',
    borderRadius:30,
  },

  contri_name:{
    fontSize:18,
    flex:1,
    fontWeight:'bold',
    color: '#222',
  },
  contri_count:{
    fontSize:14,
    flex:1,
    alignSelf:'center',
    color:"#6666ff"
  },
  contri_followButton: {
    marginTop:10,
    height:35,
    width:100,
    padding:10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius:30,
    backgroundColor: "white",
    borderWidth:1,
    borderColor:"#dcdcdc",
  },
  contri_followButtonText:{
    color: "#f2a18d",
    fontSize:12,
  }
})
