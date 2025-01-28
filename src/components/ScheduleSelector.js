import React, { Component } from 'react';
import ScheduleSelector from 'react-schedule-selector'

class ScheduleSelectorComponent extends Component {
  state = { schedule : [] }

  handleChange = newSchedule => {
    this.setState({ schedule: newSchedule })
  }

  render() {
    return (
      <ScheduleSelector
        selection={this.state.schedule}
        numDays={5}
        minTime={8}
        maxTime={22}
        hourlyChunks={2}
        onChange={this.handleChange}
      />
    )
  }
}

export default ScheduleSelectorComponent