import * as React from 'react'
import dayjs from 'dayjs'
import Badge from '@mui/material/Badge'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton'
import { Button } from '@mui/material'

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min)
}

function fakeFetch(date, { signal }) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const daysInMonth = date.daysInMonth()
      const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth))

      resolve({ daysToHighlight })
    }, 500)

    signal.onabort = () => {
      clearTimeout(timeout)
      reject(new DOMException('aborted', 'AbortError'))
    }
  })
}

const initialValue = dayjs('2022-04-17')

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props

  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? '🔴' : undefined}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  )
}

export default function DateCalendarServerRequest() {
  const requestAbortController = React.useRef(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [highlightedDays, setHighlightedDays] = React.useState([1, 2, 15])

  const fetchHighlightedDays = (date) => {
    const controller = new AbortController()
    fakeFetch(date, {
      signal: controller.signal,
    })
      .then(({ daysToHighlight }) => {
        setHighlightedDays(daysToHighlight)
        setIsLoading(false)
      })    
      .catch((error) => {
        if (error.name !== 'AbortError') {
          throw error
        }
      })

    requestAbortController.current = controller
  }

  React.useEffect(() => {
    fetchHighlightedDays(initialValue)
    return () => requestAbortController.current?.abort()
  }, [])

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort()
    }

    setIsLoading(true)
    setHighlightedDays([])
    fetchHighlightedDays(date)
  }

  function Adicionar() {
    
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        defaultValue={initialValue}
        loading={isLoading}
        onMonthChange={handleMonthChange}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            highlightedDays,
          },
        }}  
      />
      <Button variant='contained'>Cadastrar</Button>
    </LocalizationProvider>
  )
}
