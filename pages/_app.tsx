/* from material-ui's typescript next.js example */
import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/lib/theme';

export default class MyApp extends App {
  componentDidMount(): void {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <React.Fragment>
        <Head>
          <title>Chordly</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <meta property="og:title" content="Chordly" />
          <meta property="og:image" content="https://chordly.xyz/preview.png" />
          <meta
            property="og:description"
            content="An interactive chord progression explorer."
          />
          <meta property="og:url" content="https://chordly.xyz" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </React.Fragment>
    );
  }
}
