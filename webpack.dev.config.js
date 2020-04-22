/* eslint-disable */
'use strict';

const webpack = require('webpack');
const webpackConfig = require('./webpack.base.config');

webpackConfig.mode = 'development';

let dhisConfig;

function getConfig() {
    const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME.trimRight('/')}/config`;
    console.log(`using config.json from ${dhisConfigPath}`)
    return require(dhisConfigPath);
}


try {
    dhisConfig = getConfig();
    console.log(dhisConfig)
} catch (e) {
    // Failed to load config file - use default config
    console.log('\nWARNING! Failed to load DHIS config:' + e.message);
    dhisConfig = {
        baseUrl: 'http://localhost:8080/',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}

webpackConfig.plugins = [
    new webpack.DefinePlugin({
        DHIS_CONFIG: JSON.stringify(dhisConfig)
    })
];

function log(req, res, opt) {
    req.headers.Authorization = dhisConfig.authorization;
    console.log('[PROXY]', req.method, req.url, '=>', opt.target);
}

webpackConfig.devServer = {
    contentBase: './src',
    progress: true,
    port: 8081,
    open: false,
    proxy: [
        { path: '/api/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-commons/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-core-resource/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-event-reports/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-event-visualizer/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-pivot/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-visualizer/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-data-visualizer/**', target: dhisConfig.baseUrl, bypass: log },
        { path: '/dhis-web-maps/**', target: dhisConfig.baseUrl, bypass: log },
    ],
};

module.exports = webpackConfig;

