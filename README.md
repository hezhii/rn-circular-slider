# rn-circular-slider

React Native circular slider based on [react-native-svg](https://github.com/react-native-community/react-native-svg)

<div align=center><img src=".github/screenshot.gif"></div>

## Installation

Install the `rn-circular-slider` package in your React Native project.

```bash
$ yarn add rn-circular-slider
```

Next, install [react-native-svg](https://github.com/react-native-community/react-native-svg)

```bash
$ yarn add react-native-svg
$ react-native link react-native-svg
```

## Usage

```js
import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import CircularSlider from 'rn-circular-slider'

console.disableYellowBox = true

export default class App extends Component {
  state = {
    value: 50
  }

  render() {
    const { value } = this.state
    return (
      <View style={styles.container}>
        <CircularSlider
          step={2}
          min={10}
          max={80}
          value={value}
          onChange={value => this.setState({ value })}
          contentContainerStyle={styles.contentContainerStyle}
          strokeWidth={10}
          buttonBorderColor="#3FE3EB"
          buttonFillColor="#fff"
          buttonStrokeWidth={10}
          openingRadian={Math.PI / 4}
          buttonRadius={10}
          linearGradient={[{ stop: '0%', color: '#3FE3EB' }, { stop: '100%', color: '#7E84ED' }]}
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
    fontWeight: '500',
    fontSize: 32,
    color: '#3FE3EB'
  }
});
```