import React, { useState, useRef } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { askPlantQuestion } from "../utils/openaiClient";

const QUICK_PROMPTS = [
  "Why are my tomato leaves turning yellow?",
  "How do I know if I'm overwatering?",
  "Best plants for a shady apartment?",
  "When should I fertilize my herbs?",
  "How do I get rid of aphids naturally?",
];

export default function AIAssistantScreen() {
  const [messages, setMessages]   = useState([
    { role: "assistant", content: "Hi! 🌱 I'm GardenBot. Ask me anything about your plants — care tips, problem diagnosis, or general gardening advice!" }
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const scrollRef                 = useRef(null);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    // scroll to bottom
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const reply = await askPlantQuestion(userMsg, history.slice(0, -1));
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't reach the server. Check your internet connection.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }

  async function speakMessage(text) {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  function clearChat() {
    Speech.stop();
    setSpeaking(false);
    setMessages([{
      role: "assistant",
      content: "Hi! 🌱 I'm GardenBot. Ask me anything about your plants!",
    }]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Garden Helper 🤖</Text>
          <Text style={styles.subtitle}>Powered by GPT-4o</Text>
        </View>
        <TouchableOpacity onPress={clearChat}>
          <Ionicons name="refresh" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Quick prompts */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.quickScroll} contentContainerStyle={styles.quickContent}
        >
          {QUICK_PROMPTS.map((p, i) => (
            <TouchableOpacity key={i} style={styles.quickChip} onPress={() => send(p)}>
              <Text style={styles.quickText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollRef} style={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[styles.bubble, msg.role === "user" ? styles.userBubble : styles.botBubble]}
            >
              {msg.role === "assistant" && (
                <Text style={styles.botLabel}>🌿 GardenBot</Text>
              )}
              <Text style={msg.role === "user" ? styles.userText : styles.botText}>
                {msg.content}
              </Text>
              {msg.role === "assistant" && (
                <TouchableOpacity
                  style={styles.speakBtn}
                  onPress={() => speakMessage(msg.content)}
                >
                  <Ionicons
                    name={speaking ? "stop-circle" : "volume-medium"}
                    size={16} color="#4A7C59"
                  />
                  <Text style={styles.speakText}>{speaking ? "Stop" : "Listen"}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {loading && (
            <View style={styles.botBubble}>
              <Text style={styles.botLabel}>🌿 GardenBot</Text>
              <ActivityIndicator color="#4A7C59" size="small" style={{ marginTop: 4 }} />
            </View>
          )}
          <View style={{ height: 10 }} />
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about your plants…"
            placeholderTextColor="#e6e8eb"
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#121111" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#161615" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#d3dae3" },
  subtitle: { fontSize: 12, color: "#b2b8c2", marginTop: 1 },
  quickScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  quickContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quickChip: {
    backgroundColor: "#96d9ba", borderWidth: 1, borderColor: "#a0dcb5",
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5,
  },
  quickText: { fontSize: 12, color: "#166534", fontWeight: "500" },
  messages: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#4A7C59" },
  botBubble: {
    alignSelf: "flex-start", backgroundColor: "#292828",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  botLabel: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", marginBottom: 4 },
  userText: { fontSize: 14, color: "#fff", lineHeight: 20 },
  botText: { fontSize: 14, color: "#f5f7f8", lineHeight: 21 },
  speakBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  speakText: { fontSize: 12, color: "#4A7C59", fontWeight: "600" },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#161615",
  },
  textInput: {
    flex: 1, backgroundColor: "#5c5e57", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: "#edf0f3", maxHeight: 100, borderWidth: 1, borderColor: "#0e0e0e",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#4A7C59",
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#8dbd9a" },
});