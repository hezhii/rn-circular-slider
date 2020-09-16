import React, { PureComponent } from 'react'
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg'
import { StyleSheet, View, PanResponder } from 'react-native'

export default class CircularSlider extends PureComponent {
  static defaultProps = {
    radius: 100, // 半径
    strokeWidth: 20, // 线宽
    openingRadian: Math.PI / 4, // 开口弧度，为了便于计算值为实际开口弧度的一半
    backgroundTrackColor: '#e8e8e8', // 底部轨道颜色
    linearGradient: [{ stop: '0%', color: '#1890ff' }, { stop: '100%', color: '#f5222d' }], // 渐变色
    min: 0, // 最小值
    max: 100, // 最大值
    buttonRadius: 12, // 按钮半径
    buttonBorderColor: '#fff', // 按钮边框颜色
    buttonStrokeWidth: 1, // 按钮线宽
  }

  constructor(props) {
    super(props)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: this._handlePanResponderEnd,
    })

    this.state = {
      value: props.value || props.min
    }

    this._containerRef = React.createRef()
  }

  _handlePanResponderGrant = () => {
    /*
     * 记录开始滑动开始时的滑块值、弧度和坐标，用户后续值的计算
     */
    const { value } = this.state
    this._moveStartValue = value
    this._moveStartRadian = this.getRadianByValue(value)
    this._startCartesian = this.polarToCartesian(this._moveStartRadian)
  };

  _handlePanResponderMove = (e, gestureState) => {
    const { min, max, step, openingRadian } = this.props
    let { x, y } = this._startCartesian
    x += gestureState.dx
    y += gestureState.dy
    const radian = this.cartesianToPolar(x, y) // 当前弧度
    const ratio = (this._moveStartRadian - radian) / ((Math.PI - openingRadian) * 2) // 弧度变化所占比例
    const diff = max - min // 最大值和最小值的差

    let value
    if (step) {
      value = this._moveStartValue + Math.round(ratio * diff / step) * step
    } else {
      value = this._moveStartValue + ratio * diff
    }
    // 处理极值
    value = Math.max(
      min,
      Math.min(max, value),
    )
    this.setState(({ value: curValue }) => {
      value = Math.abs(value - curValue) > diff / 4 ? curValue : value // 避免直接从最小值变为最大值
      return { value: (step % 1 === 0) ?  Math.round(value) : this._roundNumber(value) }
    })
    this._fireChangeEvent('onChange');
  }

  _roundNumber = (value) => {
    const { step } = this.props

    step || (step = 1.0);
    const inv = 1.0 / step;
    
    return Math.round(value * inv) / inv;
  }
  _handlePanResponderEnd = (e, gestureState) => {
    if (this.props.disabled) {
      return;
    }

    this._fireChangeEvent('onComplete');
  }

  _fireChangeEvent = event => {
    if (this.props[event]) {
      this.props[event](this.state.value);
    }
  };

  /**
   * 极坐标转笛卡尔坐标
   * @param {number} radian - 弧度表示的极角
   */
  polarToCartesian(radian) {
    const { radius } = this.props
    const distance = radius + this._getExtraSize() / 2 // 圆心距离坐标轴的距离
    const x = distance + radius * Math.sin(radian)
    const y = distance + radius * Math.cos(radian)
    return { x, y }
  }

  /**
   * 笛卡尔坐标转极坐标
   * @param {*} x 
   * @param {*} y 
   */
  cartesianToPolar(x, y) {
    const { radius } = this.props
    const distance = radius + this._getExtraSize() / 2 // 圆心距离坐标轴的距离
    if (x === distance) {
      return y > distance ? 0 : Math.PI / 2
    }
    const a = Math.atan((y - distance) / (x - distance)) // 计算点与圆心连线和 x 轴的夹角
    return (x < distance ? Math.PI * 3 / 2 : Math.PI / 2) - a
  }

  /**
   * 获取当前弧度
   */
  getCurrentRadian() {
    return this.getRadianByValue(this.state.value)
  }

  /**
   * 根据滑块的值获取弧度
   * @param {*} value 
   */
  getRadianByValue(value) {
    const { openingRadian, min, max } = this.props
    return (Math.PI - openingRadian) * 2 * (max - value) / (max - min) + openingRadian
  }

  /**
   * 获取除半径外额外的大小，返回线宽和按钮直径中较大的
   */
  _getExtraSize() {
    const { strokeWidth, buttonRadius, buttonStrokeWidth } = this.props
    return Math.max(strokeWidth, (buttonRadius + buttonStrokeWidth) * 2)
  }

  _onLayout = () => {
    const ref = this._containerRef.current
    if (ref) {
      ref.measure((x, y, width, height, pageX, pageY) => {
        this.vertexX = pageX
        this.vertexY = pageY
      })
    }
  }

  render() {
    const {
      radius,
      strokeWidth,
      backgroundTrackColor,
      openingRadian,
      linearGradient,
      buttonRadius,
      buttonBorderColor,
      buttonFillColor,
      buttonStrokeWidth,
      style,
      contentContainerStyle,
      children
    } = this.props
    const svgSize = radius * 2 + this._getExtraSize()
    const startRadian = 2 * Math.PI - openingRadian // 起点弧度
    const startPoint = this.polarToCartesian(startRadian)
    const endPoint = this.polarToCartesian(openingRadian)
    const currentRadian = this.getCurrentRadian() // 当前弧度
    const curPoint = this.polarToCartesian(currentRadian)

    const contentStyle = [
      styles.content,
      contentContainerStyle
    ]

    return (
      <View onLayout={this._onLayout} ref={this._containerRef} style={[styles.container, style]}>
        <Svg width={svgSize} height={svgSize}>
          <Defs>
            <LinearGradient
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
              id="gradient">
              {
                linearGradient.map((item, index) => (
                  <Stop
                    key={index}
                    offset={item.stop}
                    stopColor={item.color}
                  />
                ))
              }
            </LinearGradient>
          </Defs>
          <Path
            strokeWidth={strokeWidth}
            stroke={backgroundTrackColor}
            fill="none"
            strokeLinecap="round"
            d={`M${startPoint.x},${startPoint.y} A ${radius},${radius},0,${startRadian - openingRadian >= Math.PI ? '1' : '0'},1,${endPoint.x},${endPoint.y}`}
          />
          <Path
            strokeWidth={strokeWidth}
            stroke="url(#gradient)"
            fill="none"
            strokeLinecap="round"
            d={`M${startPoint.x},${startPoint.y} A ${radius},${radius},0,${startRadian - currentRadian >= Math.PI ? '1' : '0'},1,${curPoint.x},${curPoint.y}`}
          />
          <Circle
            cx={curPoint.x}
            cy={curPoint.y}
            r={buttonRadius}
            fill={buttonFillColor || buttonBorderColor}
            stroke={buttonBorderColor}
            strokeWidth={buttonStrokeWidth}
            {...this._panResponder.panHandlers}
          />
        </Svg>
        <View style={contentStyle} pointerEvents="box-none">
          {children}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  }
})
