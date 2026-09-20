package com.ext.techapp.thirukkural;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.text.Spanned;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

/**
 * A simple {@link Fragment} subclass for displaying about information.
 */
public class AboutFragment extends Fragment {
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";
    public static final String ABOUT_TEXT_ID = "about_text_id";

    private String mParam1;
    private String mParam2;

    private OnFragmentInteractionListener mListener;

    public static AboutFragment newInstance(String param1, String param2) {
        AboutFragment fragment = new AboutFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public AboutFragment() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_about, container, false);
        TextView abouTextView = view.findViewById(R.id.about_fragment_text);
        if (getArguments() != null && getArguments().getInt(AboutFragment.ABOUT_TEXT_ID) == R.id.thiruvalluvar) {
            String text = getString(R.string.about_thiruvalluvar);
            Spanned spanned = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
                    ? Html.fromHtml(text, Html.FROM_HTML_MODE_LEGACY)
                    : Html.fromHtml(text);
            abouTextView.setText(spanned);
        } else {
            String text = getString(R.string.about_thirukkural);
            Spanned spanned = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
                    ? Html.fromHtml(text, Html.FROM_HTML_MODE_LEGACY)
                    : Html.fromHtml(text);
            abouTextView.setText(spanned);
        }
        return view;
    }

    public void onButtonPressed(Uri uri) {
        if (mListener != null) {
            mListener.onFragmentInteraction(uri);
        }
    }

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        if (context instanceof OnFragmentInteractionListener) {
            mListener = (OnFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    public interface OnFragmentInteractionListener {
        void onFragmentInteraction(Uri uri);
    }
}

