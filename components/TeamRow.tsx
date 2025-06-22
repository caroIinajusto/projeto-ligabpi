import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface TeamRowProps {
  team: {
    $id: string;
    name: string;
    position: number;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDifference: number;
  };
  showDetails?: boolean;
}

export default function TeamRow({ team, showDetails = true }: TeamRowProps) {
  const router = useRouter();

  const getPositionColor = () => {
    if (team.position <= 3) return '#10B981'; // Champions League
    if (team.position <= 6) return '#3B82F6'; // Europa League
    if (team.position >= 10) return '#EF4444'; // Relegation
    return '#6B7280';
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/club/${team.$id}`)}
    >
      <View style={styles.position}>
        <View style={[styles.positionIndicator, { backgroundColor: getPositionColor() }]} />
        <Text style={styles.positionText}>{team.position}</Text>
      </View>

      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>

      {showDetails && (
        <View style={styles.stats}>
          <Text style={styles.statText}>{team.played}</Text>
          <Text style={styles.statText}>{team.wins}</Text>
          <Text style={styles.statText}>{team.draws}</Text>
          <Text style={styles.statText}>{team.losses}</Text>
          <Text style={styles.statText}>
            {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
          </Text>
        </View>
      )}

      <Text style={styles.points}>{team.points}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  position: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  positionIndicator: {
    width: 3,
    height: 20,
    marginRight: 8,
    borderRadius: 2,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  stats: {
    flexDirection: 'row',
    width: 120,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    width: 24,
    textAlign: 'center',
  },
  points: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    width: 30,
    textAlign: 'right',
  },
});