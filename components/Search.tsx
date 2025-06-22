import { View, TextInput } from "react-native";
import { useState } from "react";

type SearchProps = {
  placeholder?: string;
  onChange?: (text: string) => void;
};

export default function Search({ placeholder = "Pesquisar...", onChange }: SearchProps) {
  const [value, setValue] = useState("");

  const handleChange = (text: string) => {
    setValue(text);
    if (onChange) onChange(text);
  };

  return (
    <View style={{ marginTop: 16, marginBottom: 8 }}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        style={{
          backgroundColor: "#f3e8ff",
          borderRadius: 8,
          padding: 10,
          fontSize: 16,
        }}
      />
    </View>
  );
}
