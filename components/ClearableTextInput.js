import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * A reusable TextInput component with a built-in clear button.
 * It accepts all standard TextInput props.
 * @param {object} props
 * @param {string} props.value - The value of the input.
 * @param {function} props.onChangeText - The function to call when text changes.
 * @param {boolean} [props.editable=true] - If the input is editable.
 */
const ClearableTextInput = React.forwardRef(({ value, onChangeText, editable = true, ...props }, ref) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                ref={ref}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                style={styles.input}
                {...props}
            />
            {value && value.length > 0 && editable && (
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
        height: 48, // Set a fixed height to prevent resizing
    },
    input: {
        flex: 1,
        fontFamily: 'PlaypenSans-Regular',
        paddingHorizontal: 10,
        fontSize: 16,
        // The height is controlled by the container
    },
    clearButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#888',
        fontSize: 16,
        fontFamily: 'PlaypenSans-Bold',
    },
});

export default ClearableTextInput;