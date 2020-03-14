import { createMuiTheme } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: Colors.blue[400],
    },
    secondary: {
      main: Colors.deepOrange[300],
    },
  },
});

export default theme;
