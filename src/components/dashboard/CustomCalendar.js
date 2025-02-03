import React, { useRef, useEffect, useState } from "react";
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT, DemoData } from "react-big-schedule";
import dayjs from "dayjs";
import "dayjs/locale/it";
import "react-big-schedule/dist/css/style.css";
import "../../calendar.css";

// Imposta la lingua italiana per Day.js
dayjs.locale("it");

const CustomCalendar = () => {
  const parentRef = useRef(null);
  const [viewModel, setViewModel] = useState(() => {
    const schedulerData = new SchedulerData(dayjs().format(DATE_FORMAT), ViewType.Week, false, false, {
      responsiveByParent: true,
      localeDayjs: dayjs,
    });
    schedulerData.config.dragAndDropEnabled = false;
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    return schedulerData;
  });

  useEffect(() => {
    if (parentRef.current) {
      console.log(parentRef.current);

    }
  }, [viewModel]);

  const prevClick = () => {
    viewModel.prev();
    viewModel.setEvents(DemoData.events);
    setViewModel({ ...viewModel });
  };

  const nextClick = () => {
    viewModel.next();
    viewModel.setEvents(DemoData.events);
    setViewModel({ ...viewModel });
  };

  const onViewChange = (view) => {
    viewModel.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    viewModel.setEvents(DemoData.events);
    setViewModel({ ...viewModel });
  };

  const onSelectDate = (date) => {
    viewModel.setDate(date);
    viewModel.setEvents(DemoData.events);
    setViewModel({ ...viewModel });
  };

  return (
    <div>
      <div ref={parentRef}>
        <Scheduler
          schedulerData={viewModel}
          prevClick={prevClick}
          nextClick={nextClick}
          onSelectDate={onSelectDate}
          onViewChange={onViewChange}
          parentRef={parentRef}

        />
      </div>
    </div>
  );
};

export default CustomCalendar;