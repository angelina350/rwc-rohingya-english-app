import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { colors } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IconName; color: ColorValue; size: number }) {
  return <Ionicons name={name} color={color as string} size={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen
        name="speak"
        options={{ title: 'Speak', tabBarIcon: (p) => <TabIcon name="mic" {...p} /> }}
      />
      <Tabs.Screen
        name="words"
        options={{ title: 'Saved', tabBarIcon: (p) => <TabIcon name="book" {...p} /> }}
        listeners={() => ({
          tabPress: (event) => {
            event.preventDefault();
            router.navigate('/words');
          },
        })}
      />
      <Tabs.Screen
        name="scenario"
        options={{ title: 'Scenario', tabBarIcon: (p) => <TabIcon name="chatbubbles" {...p} /> }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', tabBarIcon: (p) => <TabIcon name="school" {...p} /> }}
      />
    </Tabs>
  );
}
