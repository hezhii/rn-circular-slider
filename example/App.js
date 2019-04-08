/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import CircularSlider from 'rn-circular-slider'

console.disableYellowBox = true

export default class App extends Component {
  state = {
    value: 0
  }

  render() {
    const { value } = this.state
    return (
      <View style={styles.container}>
        <CircularSlider
          min={0}
          max={50}
          value={value}
          onChange={value => this.setState({ value })}
          contentContainerStyle={styles.contentContainerStyle}
        >
          <Text style={styles.value}>{value}</Text>
        </CircularSlider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  value: {
    fontSize: 20
  }
});
