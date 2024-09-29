import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';


class CalendarioEscolarPage extends StatefulWidget {
  @override
  _CalendarScreenState createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarioEscolarPage> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Calendário Escolar'),
      ),
      body: SingleChildScrollView( // Use SingleChildScrollView for better scrolling
        child: Column(
          children: [
            TableCalendar(
              firstDay: DateTime.utc(2024, 1, 1),
              lastDay: DateTime.utc(2024, 12, 31),
              focusedDay: _focusedDay,
              calendarFormat: _calendarFormat,
              onFormatChanged: (format) => setState(() => _calendarFormat = format), // Concise arrow function syntax
              onDaySelected: (selectedDay, focusedDay) => setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              }),
              selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            ),
            SizedBox(height: 20.0),
            _selectedDay != null
                ? Text('Data selecionada: ${_selectedDay!.toIso8601String()}') // Using null-aware operator for _selectedDay
                : SizedBox(),
          ],
        ),
      ),
    );
  }
}
