import React, { Component } from 'react';
import { Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView, StyleSheet } from 'react-native';

import { Button, Block, Input, Text } from '../components';
import { theme } from '../constants';
import * as firebase from 'firebase';

export default class SignUp extends Component {
  state = {
    email: null,
    username: null,
    password: null,
    errors: [],
    loading: false,
  }

  handleSignUp() {
    const { navigation } = this.props;
    const { email, username, password } = this.state;
    const errors = [];

    Keyboard.dismiss();
    this.setState({ loading: true });

    setTimeout(() => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
          console.log("Authentication success");
          let userUniqueId = firebase.auth().currentUser.uid;
          this.CreateUserTableInDB(username,email,password,userUniqueId);
          Alert.alert(
            'Success!',
            'Your account has been created',
            [
              {
                text: 'Continue', onPress: () => {
                  navigation.navigate('login')
                }
              }
            ],
            { cancelable: false }
          )
        })
        .catch(error => {
          this.setState({ isLoading: false });
          Alert.alert(error.message);
        });
    }, 300);

    this.setState({loading: false });
  }

  CreateUserTableInDB=(username,email,password,userUniqueId)=>{
    setTimeout(() => {
      firebase.database().ref("Users/" + userUniqueId).set({
          ID:userUniqueId,
          USERNAME: username,
          EMAIL: email,
          PASSWORD: password,
        })
        .then(() => {
          console.log("User attributes pushed");
        })
        .catch(error => {
          console.log("User attributes failed to pushed");
          this.setState({ isLoading: false });
        });
    }, 200);
  }

  render() {
    const { navigation } = this.props;
    const { loading, errors } = this.state;
    const hasErrors = key => errors.includes(key) ? styles.hasErrors : null;

    return (
      <KeyboardAvoidingView style={styles.signup} behavior="padding">
        <Block padding={[0, theme.sizes.base * 2]}>
          <Text h1 bold>Sign Up</Text>
          <Block middle>
            <Input
              email
              label="Email"
              error={hasErrors('email')}
              style={[styles.input, hasErrors('email')]}
              defaultValue={this.state.email}
              onChangeText={text => this.setState({ email: text })}
            />
            <Input
              label="Username"
              error={hasErrors('username')}
              style={[styles.input, hasErrors('username')]}
              defaultValue={this.state.username}
              onChangeText={text => this.setState({ username: text })}
            />
            <Input
              secure
              label="Password"
              error={hasErrors('password')}
              style={[styles.input, hasErrors('password')]}
              defaultValue={this.state.password}
              onChangeText={text => this.setState({ password: text })}
            />
            <Button gradient onPress={() => this.handleSignUp()}>
              {loading ?
                <ActivityIndicator size="small" color="white" /> :
                <Text bold white center>Sign Up</Text>
              }
            </Button>

            <Button onPress={() => navigation.navigate('Login')}>
              <Text gray caption center style={{ textDecorationLine: 'underline' }}>
                Back to Login
              </Text>
            </Button>
          </Block>
        </Block>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  signup: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent,
  }
})
