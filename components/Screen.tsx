import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// ponytail: 라우트 배선을 클릭으로 확인하기 위한 임시 껍데기.
// design.md §8-5 에서 화면을 실제로 만들 때 파일별로 걷어낸다.
export type Href = React.ComponentProps<typeof Link>['href'];

type Props = {
  id: string;
  title: string;
  note?: string;
  to?: [Href, string][];
  actions?: [() => void, string][];
};

export default function Screen({ id, title, note, to = [], actions = [] }: Props) {
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.id}>{id}</Text>
      <Text style={s.title}>{title}</Text>
      {note ? <Text style={s.note}>{note}</Text> : null}
      <View style={s.links}>
        {to.map(([href, label], i) => (
          <Link key={i} href={href} style={s.link}>
            {label}
          </Link>
        ))}
        {actions.map(([onPress, label], i) => (
          <Pressable key={i} onPress={onPress} accessibilityRole="button">
            <Text style={s.link}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 8 },
  id: { fontSize: 11, fontFamily: 'Menlo', color: '#8d8d8d' },
  title: { fontSize: 20, fontWeight: '600' },
  note: { fontSize: 13, color: '#8d8d8d', lineHeight: 19 },
  links: { marginTop: 12, gap: 2 },
  link: { fontSize: 15, color: '#1a5cff', paddingVertical: 11 },
});
