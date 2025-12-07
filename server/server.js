const app = require('./src/app');
const config = require('./src/config');

app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});
