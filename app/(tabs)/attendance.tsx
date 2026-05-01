import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function AttendanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Attendance Module Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
