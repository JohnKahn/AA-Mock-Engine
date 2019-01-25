'use strict';
const _ = require("lodash");
const mockDataGenerator = require("../../mock/mockDataGenerator");

module.exports = {
    createMockData
};

function createMockData(req, res) {
    console.log("Adding mock data to MongoDB");
    let startDateString = req.query.startDate;
    let endDateString = req.query.endDate;

    var dates;

    try {
        dates = mockDataGenerator.rangeForDates(startDateString, endDateString);
    } catch (err) {
        console.error('Failed to generate date range for mock data: ', err)
        res.status(400).send(err);
        return;
    }

    mockDataGenerator.createUserAndAirportData()
    mockDataGenerator.createMockFlightDataForRange(dates.start, dates.end)

    // TODO: Investigate a more appropriate way of handling errors during import
    res.json("Mock data import started. Please check the logs for more information.");
}