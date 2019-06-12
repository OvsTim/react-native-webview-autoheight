/**
 * Custom WebView with autoHeight feature
 *
 * @prop source: Same as WebView
 * @prop autoHeight: true|false
 * @prop defaultHeight: 100
 * @prop width: device Width
 * @prop ...props
 *
 * @author Elton Jain
 * @version v1.0.2
 */

import React, {Component} from 'react';
import {
    View,
    Dimensions,
    Platform, Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
const injectedScript = function () {
    function waitForBridge() {
        if (window.postMessage.length !== 1) {
            setTimeout(waitForBridge, 200);
        }
        else {
            postMessage(
                Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)
            )
        }
    }
    waitForBridge();
    true; // note: this is required, or you'll sometimes get silent failures

};

export default class MyWebView extends Component {
    state = {
        webViewHeight: Number,
        firstLoad: true
    };

    static defaultProps = {
        autoHeight: true,
    }

    constructor(props: Object) {
        super(props);
        this.state = {
            webViewHeight: this.props.defaultHeight
        }

        this._onMessage = this._onMessage.bind(this);
    }

    _onMessage(e) {
        console.log("MESSAGE",e.nativeEvent.data)
        this.setState({
            webViewHeight: parseInt(e.nativeEvent.data)
        });
    }

    stopLoading() {
        this.webview.stopLoading();
    }

    reload() {
        this.webview.reload();
    }

    render() {
        const _w = this.props.width || Dimensions.get('window').width;
        const _h = this.props.autoHeight ? this.state.webViewHeight : this.props.defaultHeight;
        const androidScript = 'window.ReactNativeWebView.postMessagee = String(Object.hasOwnProperty).replace(\'hasOwnProperty\', \'postMessage\');' +
            '(function () {\n' +
            '    function waitForBridge() {\n' +
            '        if (window.ReactNativeWebView.postMessage.length !== 1)' +
            ' {\n' +
            '    window.ReactNativeWebView.postMessage(window)\n' +

            '            setTimeout(waitForBridge, 200);\n' +
            '        }\n' +
            '        else {\n' +
            '            window.ReactNativeWebView.postMessage(\n' +
            '                Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)\n' +
            '            )\n' +
            '        }\n' +
            '    }\n' +

            '    waitForBridge();\n' +

            '    true; })();';
        const iosScript = '(' + String(injectedScript) + ')();' + 'window.postMessage = String(Object.hasOwnProperty).replace(\'hasOwnProperty\', \'postMessage\');';
        const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage( Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)); 
  }, 500);
  true; // note: this is required, or you'll sometimes get silent failures
`;
        return (
            <WebView
                ref={(ref) => {
                    this.webview = ref;
                }}
                injectedJavaScript={webViewScript}
                scrollEnabled={this.props.scrollEnabled || false}
                onMessage={this._onMessage}
                javaScriptEnabled={true}
                {...this.props}
                onShouldStartLoadWithRequest={request => {
                    console.log("Request", request);

                    // Needed on iOS for the initial load
                    if (this.state.firstLoad && Platform.OS !== "android") {
                        this.setState({firstLoad: false});
                        return true
                    }
                    Linking.canOpenURL(request.url)
                        .then((supported) => {
                            if (!supported) {
                                console.log("Can't handle url: " + request.url);
                            } else {
                                return Linking.openURL(request.url);
                            }
                        })
                        .catch((err) => console.error('An error occurred', err));
                    return false
                }}
                style={[{width: _w}, this.props.style, {flex: 0,height: _h}]}
            />
        )
    }
}
